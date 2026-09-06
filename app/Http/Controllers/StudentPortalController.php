<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentLeaveRequest;
use App\Models\TeachingSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class StudentPortalController extends Controller
{
    /**
     * Get the authenticated student model
     */
    protected function getStudent()
    {
        $user = Auth::user();
        if ($user->student) {
            return $user->student->load('schoolClass.homeroomTeacher');
        }

        // Match by username/nis if not explicitly linked
        $student = Student::with('schoolClass.homeroomTeacher')
            ->where('nis', $user->username)
            ->orWhere('nisn', $user->username)
            ->first();

        return $student;
    }

    /**
     * Helper to compute monthly attendance stats, calendar data, and percentage for a student
     */
    protected function calculateMonthlyStats($studentId, $month, $year)
    {
        $today = Carbon::today();
        $daysInMonth = Carbon::createFromDate($year, $month, 1)->daysInMonth;

        $attendances = StudentAttendance::where('student_id', $studentId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get()
            ->keyBy(fn($item) => Carbon::parse($item->date)->format('Y-m-d'));

        $calendarData = [];
        $presentCount = 0;
        $lateCount = 0;
        $sickCount = 0;
        $permitCount = 0;
        $alphaCount = 0;

        for ($d = 1; $d <= $daysInMonth; $d++) {
            $dt = Carbon::createFromDate($year, $month, $d)->startOfDay();
            $dateStr = $dt->toDateString();
            $isWeekend = $dt->isWeekend();
            $isPastDay = $dt->lt($today);

            $record = $attendances->get($dateStr);

            if ($record) {
                $status = $record->check_in_status;
            } else {
                if ($isPastDay && !$isWeekend) {
                    $status = 'alpha';
                } else {
                    $status = null;
                }
            }

            if ($status === 'present') $presentCount++;
            elseif ($status === 'late') $lateCount++;
            elseif ($status === 'sick') $sickCount++;
            elseif ($status === 'permit') $permitCount++;
            elseif ($status === 'alpha' && !$isWeekend) $alphaCount++;

            $calendarData[] = [
                'day' => $d,
                'date' => $dateStr,
                'day_name' => $dt->translatedFormat('l'),
                'is_weekend' => $isWeekend,
                'check_in_time' => $record?->check_in_time ? substr($record->check_in_time, 0, 5) : null,
                'check_out_time' => $record?->check_out_time ? substr($record->check_out_time, 0, 5) : null,
                'status' => $status,
                'notes' => $record?->notes,
            ];
        }

        $totalRecorded = $presentCount + $lateCount + $sickCount + $permitCount + $alphaCount;
        $disciplinePercentage = $totalRecorded > 0
            ? (int) round((($presentCount + $lateCount) / $totalRecorded) * 100)
            : 100;

        return [
            'calendarData' => $calendarData,
            'monthlyStats' => [
                'present' => $presentCount,
                'late' => $lateCount,
                'sick' => $sickCount,
                'permit' => $permitCount,
                'alpha' => $alphaCount,
                'total' => $totalRecorded,
                'percentage' => $disciplinePercentage,
            ],
        ];
    }

    /**
     * Student Portal Dashboard
     */
    public function dashboard()
    {
        $student = $this->getStudent();

        if (!$student) {
            return Inertia::render('StudentPortal/NoProfile', [
                'message' => 'Akun pengguna Anda belum terhubung dengan data profil siswa. Silakan hubungi Administrator Sekolah.',
            ]);
        }

        $today = Carbon::today();
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        // Today's attendance
        $todayAttendance = StudentAttendance::where('student_id', $student->id)
            ->whereDate('date', $today)
            ->first();

        // Monthly stats calculation
        $statsCalculated = $this->calculateMonthlyStats($student->id, $currentMonth, $currentYear);

        // Recent 7 attendance records
        $recentAttendances = StudentAttendance::where('student_id', $student->id)
            ->orderBy('date', 'desc')
            ->take(7)
            ->get()
            ->map(fn($att) => [
                'id' => $att->id,
                'date' => Carbon::parse($att->date)->format('d M Y'),
                'day_name' => Carbon::parse($att->date)->translatedFormat('l'),
                'check_in_time' => $att->check_in_time ? substr($att->check_in_time, 0, 5) : '--:--',
                'check_out_time' => $att->check_out_time ? substr($att->check_out_time, 0, 5) : '--:--',
                'status' => $att->check_in_status ?? 'alpha',
                'notes' => $att->notes,
            ]);

        // Pending leave requests
        $pendingLeaves = StudentLeaveRequest::where('student_id', $student->id)
            ->where('status', 'pending')
            ->count();

        return Inertia::render('StudentPortal/Dashboard', [
            'student' => $student,
            'todayAttendance' => $todayAttendance ? [
                'id' => $todayAttendance->id,
                'check_in_time' => $todayAttendance->check_in_time ? substr($todayAttendance->check_in_time, 0, 5) : null,
                'check_out_time' => $todayAttendance->check_out_time ? substr($todayAttendance->check_out_time, 0, 5) : null,
                'status' => $todayAttendance->check_in_status,
                'notes' => $todayAttendance->notes,
            ] : null,
            'monthlyStats' => $statsCalculated['monthlyStats'],
            'recentAttendances' => $recentAttendances,
            'pendingLeavesCount' => $pendingLeaves,
        ]);
    }

    /**
     * Student Attendance History Page
     */
    public function history(Request $request)
    {
        $student = $this->getStudent();

        if (!$student) {
            return redirect()->route('student-portal.dashboard');
        }

        $month = (int) $request->input('month', Carbon::now()->month);
        $year = (int) $request->input('year', Carbon::now()->year);

        $statsCalculated = $this->calculateMonthlyStats($student->id, $month, $year);

        return Inertia::render('StudentPortal/History', [
            'student' => $student,
            'calendarData' => $statsCalculated['calendarData'],
            'monthlyStats' => $statsCalculated['monthlyStats'],
            'filters' => [
                'month' => $month,
                'year' => $year,
            ],
        ]);
    }

    /**
     * Student Leave Requests Page
     */
    public function leaveRequests()
    {
        $student = $this->getStudent();

        if (!$student) {
            return redirect()->route('student-portal.dashboard');
        }

        $leaveRequests = StudentLeaveRequest::where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($req) => [
                'id' => $req->id,
                'type' => $req->type,
                'start_date' => Carbon::parse($req->start_date)->format('d M Y'),
                'end_date' => Carbon::parse($req->end_date)->format('d M Y'),
                'reason' => $req->reason,
                'attachment_url' => $req->attachment_url,
                'status' => $req->status,
                'rejection_reason' => $req->rejection_reason,
                'created_at' => $req->created_at->format('d M Y H:i'),
            ]);

        return Inertia::render('StudentPortal/LeaveRequests', [
            'student' => $student,
            'leaveRequests' => $leaveRequests,
        ]);
    }

    /**
     * Store Mandate Leave Request
     */
    public function storeLeaveRequest(Request $request)
    {
        $student = $this->getStudent();

        if (!$student) {
            return back()->withErrors(['error' => 'Profil siswa tidak ditemukan.']);
        }

        $validated = $request->validate([
            'type' => 'required|in:sick,permit',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:500',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:3072',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('student-leave-attachments', 'public');
        }

        StudentLeaveRequest::create([
            'student_id' => $student->id,
            'class_id' => $student->school_class_id,
            'type' => $validated['type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'reason' => $validated['reason'],
            'attachment_path' => $attachmentPath,
            'status' => 'pending',
            'submitted_by' => Auth::id(),
        ]);

        return back()->with('message', 'Permohonan izin/sakit berhasil dikirim dan menunggu persetujuan Wali Kelas.');
    }

    /**
     * Digital QR Card Page
     */
    public function digitalCard()
    {
        $student = $this->getStudent();

        if (!$student) {
            return redirect()->route('student-portal.dashboard');
        }

        return Inertia::render('StudentPortal/DigitalCard', [
            'student' => $student,
        ]);
    }

    /**
     * Display Student Profile Page
     */
    public function profile()
    {
        $student = $this->getStudent();

        if (!$student) {
            return Inertia::render('StudentPortal/NoProfile', [
                'message' => 'Akun pengguna Anda belum terhubung dengan data profil siswa.',
            ]);
        }

        return Inertia::render('StudentPortal/Profile', [
            'student' => $student,
        ]);
    }

    /**
     * Update Student Profile & Parent Biodata
     */
    public function updateProfile(Request $request)
    {
        $student = $this->getStudent();

        if (!$student) {
            return back()->withErrors(['message' => 'Profil siswa tidak ditemukan.']);
        }

        $validated = $request->validate([
            // Data Siswa
            'name' => 'required|string|max:255',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'pob' => 'nullable|string|max:100',
            'dob' => 'nullable|date',
            'nik' => 'nullable|string|max:20|regex:/^[0-9]*$/',
            'address' => 'nullable|string|max:500',
            'rt' => 'nullable|string|max:10|regex:/^[0-9]*$/',
            'rw' => 'nullable|string|max:10|regex:/^[0-9]*$/',
            'village' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'regency' => 'nullable|string|max:100',
            'kip_number' => 'nullable|string|max:50',
            'previous_school' => 'nullable|string|max:150',
            'family_card_number' => 'nullable|string|max:20|regex:/^[0-9]*$/',
            'student_phone' => 'nullable|string|max:30|regex:/^[0-9]*$/',

            // Data Ayah
            'father_name' => 'nullable|string|max:150',
            'father_pob' => 'nullable|string|max:100',
            'father_dob' => 'nullable|date',
            'father_nik' => 'nullable|string|max:20|regex:/^[0-9]*$/',
            'father_phone' => 'nullable|string|max:30|regex:/^[0-9]*$/',
            'father_job' => 'nullable|string|max:100',

            // Data Ibu
            'mother_name' => 'nullable|string|max:150',
            'mother_pob' => 'nullable|string|max:100',
            'mother_dob' => 'nullable|date',
            'mother_nik' => 'nullable|string|max:20|regex:/^[0-9]*$/',
            'mother_phone' => 'nullable|string|max:30|regex:/^[0-9]*$/',
            'mother_job' => 'nullable|string|max:100',
        ], [
            'nik.regex' => 'Nomor NIK Siswa hanya boleh diisi angka.',
            'rt.regex' => 'RT hanya boleh diisi angka.',
            'rw.regex' => 'RW hanya boleh diisi angka.',
            'family_card_number.regex' => 'Nomor Kartu Keluarga hanya boleh diisi angka.',
            'student_phone.regex' => 'Nomor HP Siswa hanya boleh diisi angka.',
            'father_nik.regex' => 'Nomor NIK Ayah hanya boleh diisi angka.',
            'father_phone.regex' => 'Nomor HP Ayah hanya boleh diisi angka.',
            'mother_nik.regex' => 'Nomor NIK Ibu hanya boleh diisi angka.',
            'mother_phone.regex' => 'Nomor HP Ibu hanya boleh diisi angka.',
        ]);

        $student->update($validated);

        return back()->with('message', 'Data profil & biodata orang tua berhasil diperbarui.');
    }

    /**
     * Display Student Class Schedule Page
     */
    public function schedule()
    {
        $student = $this->getStudent();

        if (!$student) {
            return Inertia::render('StudentPortal/NoProfile', [
                'message' => 'Akun pengguna Anda belum terhubung dengan data profil siswa.',
            ]);
        }

        $schedules = TeachingSchedule::with('employee')
            ->where('school_class_id', $student->school_class_id)
            ->orderBy('day_of_week')
            ->orderBy('hour_number')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'day_of_week' => (int) $s->day_of_week,
                'hour_number' => (int) $s->hour_number,
                'subject' => $s->subject,
                'teacher_name' => $s->employee?->name ?? 'Guru Pengampu Belum Set',
            ]);

        $todayDow = Carbon::now()->dayOfWeekIso;
        $todaySchedules = $schedules->where('day_of_week', $todayDow)->values();

        return Inertia::render('StudentPortal/Schedule', [
            'student' => $student,
            'schedules' => $schedules,
            'todaySchedules' => $todaySchedules,
            'hourSlots' => TeachingSchedule::hourSlots(),
            'dayLabels' => TeachingSchedule::dayLabels(),
            'todayDow' => $todayDow,
        ]);
    }
}

function Math_round($val) {
    return (int) round($val);
}
