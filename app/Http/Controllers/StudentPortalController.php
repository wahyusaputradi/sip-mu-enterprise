<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentLeaveRequest;
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

        // Monthly stats
        $monthlyRecords = StudentAttendance::where('student_id', $student->id)
            ->whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->get();

        $presentCount = $monthlyRecords->where('check_in_status', 'present')->count();
        $lateCount = $monthlyRecords->where('check_in_status', 'late')->count();
        $sickCount = $monthlyRecords->where('check_in_status', 'sick')->count();
        $permitCount = $monthlyRecords->where('check_in_status', 'permit')->count();
        $alphaCount = $monthlyRecords->where('check_in_status', 'alpha')->count();
        $totalRecorded = $presentCount + $lateCount + $sickCount + $permitCount + $alphaCount;

        $disciplinePercentage = $totalRecorded > 0 
            ? Math_round((($presentCount + $lateCount) / $totalRecorded) * 100) 
            : 100;

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
            'monthlyStats' => [
                'present' => $presentCount,
                'late' => $lateCount,
                'sick' => $sickCount,
                'permit' => $permitCount,
                'alpha' => $alphaCount,
                'total' => $totalRecorded,
                'percentage' => $disciplinePercentage,
            ],
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

        $daysInMonth = Carbon::createFromDate($year, $month, 1)->daysInMonth;

        $attendances = StudentAttendance::where('student_id', $student->id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date', 'asc')
            ->get()
            ->keyBy(fn($item) => Carbon::parse($item->date)->format('Y-m-d'));

        $calendarData = [];
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $dt = Carbon::createFromDate($year, $month, $d);
            $dateStr = $dt->toDateString();
            $record = $attendances->get($dateStr);

            $calendarData[] = [
                'day' => $d,
                'date' => $dateStr,
                'day_name' => $dt->translatedFormat('l'),
                'is_weekend' => $dt->isWeekend(),
                'check_in_time' => $record?->check_in_time ? substr($record->check_in_time, 0, 5) : null,
                'check_out_time' => $record?->check_out_time ? substr($record->check_out_time, 0, 5) : null,
                'status' => $record?->check_in_status ?? ($dt->isPast() && !$dt->isWeekend() ? 'alpha' : null),
                'notes' => $record?->notes,
            ];
        }

        $presentCount = $attendances->where('check_in_status', 'present')->count();
        $lateCount = $attendances->where('check_in_status', 'late')->count();
        $sickCount = $attendances->where('check_in_status', 'sick')->count();
        $permitCount = $attendances->where('check_in_status', 'permit')->count();
        $alphaCount = 0;

        foreach ($calendarData as $cd) {
            if ($cd['status'] === 'alpha' && !$cd['is_weekend']) {
                $alphaCount++;
            }
        }

        $totalRecorded = $presentCount + $lateCount + $sickCount + $permitCount + $alphaCount;
        $disciplinePercentage = $totalRecorded > 0
            ? Math_round((($presentCount + $lateCount) / $totalRecorded) * 100)
            : 100;

        $monthlyStats = [
            'present' => $presentCount,
            'late' => $lateCount,
            'sick' => $sickCount,
            'permit' => $permitCount,
            'alpha' => $alphaCount,
            'total' => $totalRecorded,
            'percentage' => $disciplinePercentage,
        ];

        return Inertia::render('StudentPortal/History', [
            'student' => $student,
            'calendarData' => $calendarData,
            'monthlyStats' => $monthlyStats,
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
            'kip_number' => 'nullable|string|max:50|regex:/^[0-9]*$/',
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
            'kip_number.regex' => 'Nomor KIP hanya boleh diisi angka.',
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
}

function Math_round($val) {
    return (int) round($val);
}
