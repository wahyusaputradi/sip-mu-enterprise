<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentLeaveRequest;
use App\Models\SchoolClass;
use App\Services\WhatsAppNotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class StudentLeaveRequestController extends Controller
{
    private const GLOBAL_ADMIN_ROLES = ['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi'];

    private function isGlobalAdmin(): bool
    {
        $user = Auth::user();
        foreach (self::GLOBAL_ADMIN_ROLES as $role) {
            if ($user->hasRole($role)) {
                return true;
            }
        }
        return false;
    }

    private function isReadOnlyUser(): bool
    {
        $user = Auth::user();
        return $user && $user->hasRole('Kesiswaan');
    }

    private function getTeacherClassIds(): array
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return [];
        }

        return SchoolClass::where('homeroom_teacher_id', $employee->id)->pluck('id')->toArray();
    }

    public function index(Request $request)
    {
        $isGlobalAdmin = $this->isGlobalAdmin();
        $isKesiswaan = $this->isReadOnlyUser();
        $isFullAccessView = $isGlobalAdmin || $isKesiswaan;
        $teacherClassIds = $this->getTeacherClassIds();

        // If not global view and not homeroom teacher for any class
        if (!$isFullAccessView && empty($teacherClassIds)) {
            abort(403, 'Akses ditolak. Menu ini hanya dapat diakses oleh Guru yang bertugas sebagai Wali Kelas.');
        }

        // Available classes dropdown options
        if ($isFullAccessView) {
            $classes = SchoolClass::orderBy('name')->get(['id', 'name']);
        } else {
            $classes = SchoolClass::whereIn('id', $teacherClassIds)->orderBy('name')->get(['id', 'name']);
        }

        // Students dropdown options for create modal
        if ($isFullAccessView) {
            $students = Student::where('status', 'active')
                ->with('schoolClass:id,name')
                ->orderBy('name')
                ->get(['id', 'nis', 'name', 'school_class_id', 'parent_phone']);
        } else {
            $students = Student::whereIn('school_class_id', $teacherClassIds)
                ->where('status', 'active')
                ->with('schoolClass:id,name')
                ->orderBy('name')
                ->get(['id', 'nis', 'name', 'school_class_id', 'parent_phone']);
        }

        // Main Query
        $query = StudentLeaveRequest::with([
            'student:id,nis,name,school_class_id,parent_phone',
            'student.schoolClass:id,name',
            'class:id,name',
            'approver:id,name'
        ])->latest();

        if (!$isFullAccessView) {
            $query->whereIn('class_id', $teacherClassIds);
        }

        // Global KPI Stats before custom filters
        $statsBaseQuery = clone $query;
        $stats = [
            'total_pending'  => (clone $statsBaseQuery)->where('status', 'pending')->count(),
            'total_approved' => (clone $statsBaseQuery)->where('status', 'approved')->count(),
            'total_rejected' => (clone $statsBaseQuery)->where('status', 'rejected')->count(),
            'total_requests' => (clone $statsBaseQuery)->count(),
        ];

        // Apply filters
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->input('class_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nis', 'like', "%{$search}%");
            });
        }

        $leaveRequests = $query->paginate(15)->withQueryString();

        return Inertia::render('StudentLeaveRequests/Index', [
            'leaveRequests' => $leaveRequests,
            'classes'       => $classes,
            'students'      => $students,
            'stats'         => $stats,
            'filters'       => $request->only(['class_id', 'status', 'search']),
            'isGlobalAdmin' => $isGlobalAdmin,
            'isReadOnly'    => $isKesiswaan,
        ]);
    }

    public function store(Request $request)
    {
        if ($this->isReadOnlyUser()) {
            return redirect()->back()->with('error', 'Akses ditolak. Peran Kesiswaan sebatas Read-Only.');
        }

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'type'       => 'required|in:sick,permit',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'reason'     => 'required|string|max:1000',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:3072',
        ]);

        $student = Student::findOrFail($validated['student_id']);
        $isGlobalAdmin = $this->isGlobalAdmin();
        $teacherClassIds = $this->getTeacherClassIds();

        $studentClassId = $student->school_class_id ?? $student->class_id;

        if (!$isGlobalAdmin && !in_array($studentClassId, $teacherClassIds)) {
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk siswa kelas ini.');
        }

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('student_leave_attachments', 'public');
        }

        StudentLeaveRequest::create([
            'student_id'      => $student->id,
            'class_id'        => $studentClassId,
            'type'            => $validated['type'],
            'start_date'      => $validated['start_date'],
            'end_date'        => $validated['end_date'],
            'reason'          => $validated['reason'],
            'attachment_path' => $attachmentPath,
            'status'          => 'pending',
            'submitted_by'    => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Pengajuan izin/sakit siswa berhasil ditambahkan.');
    }

    public function approve(Request $request, $id)
    {
        if ($this->isReadOnlyUser()) {
            return redirect()->back()->with('error', 'Akses ditolak. Peran Kesiswaan sebatas Read-Only.');
        }

        $leaveRequest = StudentLeaveRequest::with('student.schoolClass')->findOrFail($id);
        $isGlobalAdmin = $this->isGlobalAdmin();
        $teacherClassIds = $this->getTeacherClassIds();

        if (!$isGlobalAdmin && !in_array($leaveRequest->class_id, $teacherClassIds)) {
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk menyetujui permohonan kelas ini.');
        }

        $leaveRequest->update([
            'status'           => 'approved',
            'approved_by'      => Auth::id(),
            'rejection_reason' => null,
        ]);

        // Sync to student_attendances table for the date range
        $period = CarbonPeriod::create($leaveRequest->start_date, $leaveRequest->end_date);
        foreach ($period as $date) {
            $dateStr = $date->toDateString();
            StudentAttendance::updateOrCreate(
                [
                    'student_id' => $leaveRequest->student_id,
                    'date'       => $dateStr,
                ],
                [
                    'check_in_time'   => null,
                    'check_out_time'  => null,
                    'check_in_status' => $leaveRequest->type, // 'sick' or 'permit'
                    'check_out_status' => null,
                    'notes'           => $leaveRequest->reason,
                ]
            );
        }

        // Send WhatsApp Notification to Parent if WA service enabled
        if ($leaveRequest->student) {
            WhatsAppNotificationService::sendStudentLeaveNotification(
                $leaveRequest->student,
                $leaveRequest,
                'DISETUJUI'
            );
        }

        return redirect()->back()->with('success', 'Permohonan izin/sakit siswa berhasil disetujui & presensi telah diperbarui.');
    }

    public function reject(Request $request, $id)
    {
        if ($this->isReadOnlyUser()) {
            return redirect()->back()->with('error', 'Akses ditolak. Peran Kesiswaan sebatas Read-Only.');
        }

        $validated = $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $leaveRequest = StudentLeaveRequest::with('student.schoolClass')->findOrFail($id);
        $isGlobalAdmin = $this->isGlobalAdmin();
        $teacherClassIds = $this->getTeacherClassIds();

        if (!$isGlobalAdmin && !in_array($leaveRequest->class_id, $teacherClassIds)) {
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk menolak permohonan kelas ini.');
        }

        $wasApproved = ($leaveRequest->status === 'approved');

        $leaveRequest->update([
            'status'           => 'rejected',
            'approved_by'      => Auth::id(),
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        // If it was previously approved, remove auto-generated attendance records for that range
        if ($wasApproved) {
            $period = CarbonPeriod::create($leaveRequest->start_date, $leaveRequest->end_date);
            foreach ($period as $date) {
                $dateStr = $date->toDateString();
                StudentAttendance::where('student_id', $leaveRequest->student_id)
                    ->where('date', $dateStr)
                    ->whereIn('check_in_status', ['sick', 'permit'])
                    ->delete();
            }
        }

        // Send WhatsApp Notification to Parent if WA service enabled
        if ($leaveRequest->student) {
            WhatsAppNotificationService::sendStudentLeaveNotification(
                $leaveRequest->student,
                $leaveRequest,
                'DITOLAK'
            );
        }

        return redirect()->back()->with('success', 'Permohonan izin/sakit siswa ditolak.');
    }

    public function destroy($id)
    {
        if ($this->isReadOnlyUser()) {
            return redirect()->back()->with('error', 'Akses ditolak. Peran Kesiswaan sebatas Read-Only.');
        }

        $leaveRequest = StudentLeaveRequest::findOrFail($id);
        $isGlobalAdmin = $this->isGlobalAdmin();
        $teacherClassIds = $this->getTeacherClassIds();

        if (!$isGlobalAdmin && !in_array($leaveRequest->class_id, $teacherClassIds)) {
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk menghapus permohonan kelas ini.');
        }

        if ($leaveRequest->attachment_path && Storage::disk('public')->exists($leaveRequest->attachment_path)) {
            Storage::disk('public')->delete($leaveRequest->attachment_path);
        }

        if ($leaveRequest->status === 'approved') {
            $period = CarbonPeriod::create($leaveRequest->start_date, $leaveRequest->end_date);
            foreach ($period as $date) {
                $dateStr = $date->toDateString();
                StudentAttendance::where('student_id', $leaveRequest->student_id)
                    ->where('date', $dateStr)
                    ->whereIn('check_in_status', ['sick', 'permit'])
                    ->delete();
            }
        }

        $leaveRequest->delete();

        return redirect()->back()->with('success', 'Data permohonan izin/sakit siswa berhasil dihapus.');
    }
}
