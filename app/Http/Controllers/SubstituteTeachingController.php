<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SubstituteTeaching;
use App\Models\TeachingSchedule;
use App\Models\LeaveRequest;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class SubstituteTeachingController extends Controller
{
    private function canApprove()
    {
        return Auth::user() && Auth::user()->hasAnyRole(['Super Admin', 'Kurikulum', 'Absensi']);
    }

    private function canApproveClaim($user, $substituteEmployeeId)
    {
        if (!$user) return false;

        // Must have one of the general approver roles: Super Admin, Kurikulum, Absensi
        if (!$user->hasAnyRole(['Super Admin', 'Kurikulum', 'Absensi'])) {
            return false;
        }

        // Find the user account of the substitute employee
        $substituteEmployee = \App\Models\Employee::with('user')->find($substituteEmployeeId);
        $substituteUser = $substituteEmployee?->user;

        // If the substitute user has the 'Absensi' role:
        // Only Super Admin and Kurikulum can approve it.
        if ($substituteUser && $substituteUser->hasRole('Absensi')) {
            return $user->hasAnyRole(['Super Admin', 'Kurikulum']);
        }

        return true;
    }

    public function index(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        $carbonDate = Carbon::parse($date);
        $dayOfWeek = $carbonDate->dayOfWeekIso; // 1 (Monday) to 7 (Sunday)
        $now = Carbon::now();
        $isToday = $carbonDate->isToday();

        // ── Settings: Grace period for teaching sessions ──
        $teachingLateTolerance = (int) (\App\Models\SystemSetting::where('key', 'teaching_late_tolerance')->first()?->value ?? 15);
        $hourSlots = TeachingSchedule::hourSlots();

        // 1. Get employees on approved leave today
        $employeesOnLeave = LeaveRequest::where('status', 'approved')
            ->whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->pluck('employee_id')
            ->toArray();

        // 2. Get ALL teaching schedules for the selected day
        $allSchedulesToday = TeachingSchedule::with(['employee', 'schoolClass'])
            ->where('day_of_week', $dayOfWeek)
            ->get();

        // 3. Get teaching attendances that have already been submitted today
        $teachingAttendancesToday = \App\Models\TeachingAttendance::whereDate('date', $date)
            ->pluck('teaching_schedule_id')
            ->toArray();

        // 4. Per-Session Tracking: determine which classes are "empty"
        // A class is empty if:
        //   a) The teacher is on approved leave, OR
        //   b) It's today, the session start time + grace period has PASSED, AND the teacher has NOT submitted teaching attendance for this session
        $availableSchedules = $allSchedulesToday->filter(function ($schedule) use ($employeesOnLeave, $teachingAttendancesToday, $hourSlots, $teachingLateTolerance, $now, $isToday) {
            // Already attended → NOT empty
            if (in_array($schedule->id, $teachingAttendancesToday)) {
                return false;
            }

            // On approved leave → empty (regardless of time)
            if (in_array($schedule->employee_id, $employeesOnLeave)) {
                return true;
            }

            // Per-session time check (only for today, future dates show all unattended)
            if ($isToday) {
                $slot = $hourSlots[$schedule->hour_number] ?? null;
                if (!$slot) return false;

                $sessionStart = Carbon::createFromFormat('H:i', $slot['start']);
                $deadline = $sessionStart->copy()->addMinutes($teachingLateTolerance);

                // Only show as empty if the grace period has elapsed
                return $now->gte($deadline);
            }

            // For past dates, show all unattended classes
            return true;
        });

        // 5. Filter out those that already have Inval (pending or approved)
        $existingInvals = SubstituteTeaching::where('date', $date)
            ->whereIn('teaching_schedule_id', $availableSchedules->pluck('id'))
            ->get()
            ->keyBy('teaching_schedule_id');

        $lowongan = $availableSchedules->filter(function($schedule) use ($existingInvals) {
            return !isset($existingInvals[$schedule->id]) || $existingInvals[$schedule->id]->status === 'rejected';
        })->values();

        // 4. Get all invals for the selected date or overall
        $invalsQuery = SubstituteTeaching::with(['absentEmployee', 'substituteEmployee', 'teachingSchedule.schoolClass', 'approver.roles'])
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc');

        if (!$this->canApprove()) {
            // Regular employees only see their own invals or lowongan
            $employeeId = Auth::user()->employee?->id;
            $invalsQuery->where('substitute_employee_id', $employeeId);
        }

        // Apply history filters
        $historyStartDate = $request->input('history_start_date');
        $historyEndDate = $request->input('history_end_date');
        $historyStatus = $request->input('history_status');

        if ($historyStartDate) {
            $invalsQuery->whereDate('date', '>=', $historyStartDate);
        }
        if ($historyEndDate) {
            $invalsQuery->whereDate('date', '<=', $historyEndDate);
        }
        if ($historyStatus && in_array($historyStatus, ['pending', 'approved', 'rejected'])) {
            $invalsQuery->where('status', $historyStatus);
        }

        $invals = $invalsQuery->paginate(20)->withQueryString()->through(function ($inval) {
            $inval->can_be_approved = $this->canApproveClaim(Auth::user(), $inval->substitute_employee_id);
            return $inval;
        });

        return Inertia::render('Invals/Index', [
            'date' => $date,
            'lowongan' => $lowongan,
            'invals' => $invals,
            'canApprove' => $this->canApprove(),
            'employees' => Employee::where('status', 'active')->orderBy('name')->get(['id', 'name']),
            'filters' => [
                'history_start_date' => $historyStartDate,
                'history_end_date' => $historyEndDate,
                'history_status' => $historyStatus,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'absent_employee_id' => 'required|exists:employees,id',
            'teaching_schedule_id' => 'required|exists:teaching_schedules,id',
            'substitute_employee_id' => 'nullable|exists:employees,id', // Can be empty if claimed by self
            'reason' => 'nullable|string|max:255',
        ]);

        $substituteId = $request->substitute_employee_id;
        
        // If regular employee claims it, they are the substitute
        if (!$this->canApprove() || !$substituteId) {
            $employee = Auth::user()->employee;
            if (!$employee) {
                return back()->with('error', 'Akun Anda tidak terhubung dengan profil pegawai.');
            }
            $substituteId = $employee->id;
        }

        return \Illuminate\Support\Facades\DB::transaction(function () use ($request, $substituteId) {
            // Check if already claimed, lock row for update to prevent race conditions
            $existing = SubstituteTeaching::where('date', $request->date)
                ->where('teaching_schedule_id', $request->teaching_schedule_id)
                ->whereIn('status', ['pending', 'approved'])
                ->lockForUpdate()
                ->first();

            if ($existing) {
                return back()->with('error', 'Jadwal ini sudah diambil oleh pegawai lain.');
            }

            // Get the teaching schedule being claimed
            $targetSchedule = \App\Models\TeachingSchedule::findOrFail($request->teaching_schedule_id);

            // Check if substitute already has a regular teaching schedule at the same day and hour
            $conflictSchedule = \App\Models\TeachingSchedule::with('schoolClass')->where('employee_id', $substituteId)
                ->where('day_of_week', $targetSchedule->day_of_week)
                ->where('hour_number', $targetSchedule->hour_number)
                ->first();

            if ($conflictSchedule) {
                return back()->with('error', "Gagal: Anda sudah memiliki jadwal mengajar di kelas {$conflictSchedule->schoolClass->name} pada Jam ke-{$targetSchedule->hour_number}.");
            }
            
            // Check if substitute already claimed another inval schedule at the exact same time on this date
            $conflictInval = SubstituteTeaching::where('substitute_employee_id', $substituteId)
                ->where('date', $request->date)
                ->whereIn('status', ['pending', 'approved'])
                ->whereHas('teachingSchedule', function($q) use ($targetSchedule) {
                    $q->where('hour_number', $targetSchedule->hour_number);
                })
                ->first();

            if ($conflictInval) {
                return back()->with('error', "Gagal: Anda sudah mengambil Inval kelas lain pada Jam ke-{$targetSchedule->hour_number}.");
            }

            $canAutoApprove = $this->canApproveClaim(Auth::user(), $substituteId);

            SubstituteTeaching::create([
                'date' => $request->date,
                'absent_employee_id' => $request->absent_employee_id,
                'substitute_employee_id' => $substituteId,
                'teaching_schedule_id' => $request->teaching_schedule_id,
                'reason' => $request->reason ?? 'Menggantikan kelas',
                'status' => $canAutoApprove ? 'approved' : 'pending',
                'approved_by' => $canAutoApprove ? Auth::id() : null,
            ]);

            $msg = $canAutoApprove ? 'Inval berhasil ditambahkan dan disetujui.' : 'Berhasil mengambil Inval. Menunggu persetujuan Admin.';
            return back()->with('success', $msg);
        });
    }

    public function approve(SubstituteTeaching $inval)
    {
        if (!$this->canApproveClaim(Auth::user(), $inval->substitute_employee_id)) {
            abort(403);
        }

        $inval->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
        ]);

        return back()->with('success', 'Klaim Inval disetujui.');
    }

    public function reject(SubstituteTeaching $inval)
    {
        if (!$this->canApproveClaim(Auth::user(), $inval->substitute_employee_id)) {
            abort(403);
        }

        $inval->update([
            'status' => 'rejected',
            'approved_by' => Auth::id(),
        ]);

        return back()->with('success', 'Klaim Inval ditolak.');
    }
    
    public function destroy(SubstituteTeaching $inval)
    {
        $canApproveThis = $this->canApproveClaim(Auth::user(), $inval->substitute_employee_id);

        if (!$canApproveThis && $inval->substitute_employee_id !== Auth::user()->employee?->id) {
            abort(403);
        }
        
        if ($inval->status === 'approved' && !$canApproveThis) {
            return back()->with('error', 'Tidak dapat membatalkan Inval yang sudah disetujui.');
        }

        $inval->delete();
        return back()->with('success', 'Inval berhasil dihapus.');
    }
}
