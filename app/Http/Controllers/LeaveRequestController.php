<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Notifications\SystemNotification;

class LeaveRequestController extends Controller
{
    /**
     * Roles that can approve/reject leave requests.
     */
    private const APPROVER_ROLES = ['Super Admin', 'Kepala Sekolah', 'Kurikulum'];

    private function isApprover(): bool
    {
        $user = Auth::user();
        foreach (self::APPROVER_ROLES as $role) {
            if ($user->hasRole($role)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Pengajuan Cuti/Izin — user's own submissions (all roles except Super Admin).
     */
    public function index()
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            $leaveRequests = collect([]);
        } else {
            $leaveRequests = LeaveRequest::with(['employee', 'approver'])
                ->where('employee_id', $employee->id)
                ->latest()
                ->get();
        }

        $isGuru = false;
        if ($employee) {
            $isGuru = $employee->teachingSchedules()->exists() 
                || $employee->positions()->where('name', 'LIKE', '%Guru%')->exists();
        }

        return Inertia::render('LeaveRequests/Index', [
            'leaveRequests' => $leaveRequests,
            'hasEmployee' => (bool) $employee,
            'isGuru' => $isGuru,
        ]);
    }

    /**
     * Persetujuan Cuti/Izin — review page for approvers only.
     */
    public function approval()
    {
        $user = Auth::user();
        if (!$this->isApprover() && !$user->hasRole('Absensi')) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        $leaveRequests = LeaveRequest::with(['employee', 'approver'])
            ->latest()
            ->get();

        return Inertia::render('LeaveRequests/Approval', [
            'leaveRequests' => $leaveRequests,
            'canApprove'    => $this->isApprover(),
        ]);
    }

    /**
     * Store a new leave request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date' . ($request->duration_type === 'partial' ? '|same:start_date' : ''),
            'type' => 'required|in:cuti,izin,sakit,izin_pribadi,izin_dinas_luar,izin_pulang_cepat',
            'duration_type' => 'nullable|in:full_day,partial',
            'start_time' => 'required_if:duration_type,partial|nullable|date_format:H:i',
            'end_time' => 'required_if:duration_type,partial|nullable|date_format:H:i|after:start_time',
            'reason' => 'required|string|max:1000',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ], [
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'end_date.required' => 'Tanggal selesai wajib diisi.',
            'end_date.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
            'end_date.same' => 'Pengajuan dengan rentang waktu harus di hari yang sama.',
            'type.required' => 'Jenis pengajuan wajib dipilih.',
            'type.in' => 'Jenis pengajuan tidak valid.',
            'start_time.required_if' => 'Jam mulai wajib diisi jika memilih rentang waktu.',
            'end_time.required_if' => 'Jam selesai wajib diisi jika memilih rentang waktu.',
            'end_time.after' => 'Jam selesai harus setelah jam mulai.',
            'reason.required' => 'Keterangan/alasan wajib diisi.',
            'reason.max' => 'Keterangan maksimal 1000 karakter.',
            'attachment.mimes' => 'Lampiran harus berupa file JPG, PNG, atau PDF.',
            'attachment.max' => 'Ukuran lampiran maksimal 2 MB.',
        ]);

        $employee = Auth::user()->employee;

        if (!$employee) {
            return back()->with('error', 'Akun Anda belum terhubung dengan data pegawai. Hubungi administrator.');
        }

        $attachmentPath = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentName = $file->getClientOriginalName();
            $disk = config('filesystems.default', 'public');
            $attachmentPath = $file->store('leave-attachments', $disk);
        }

        LeaveRequest::create([
            'employee_id' => $employee->id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'type' => $request->type,
            'duration_type' => $request->duration_type ?? 'full_day',
            'start_time' => $request->duration_type === 'partial' ? $request->start_time : null,
            'end_time' => $request->duration_type === 'partial' ? $request->end_time : null,
            'reason' => $request->reason,
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
            'status' => 'pending',
        ]);

        $approvers = User::role(['Super Admin', 'Kurikulum', 'Kepala Sekolah'])->get();
        foreach ($approvers as $approver) {
            $approver->notify(new SystemNotification(
                'Pengajuan Cuti Baru',
                "Pegawai {$employee->name} mengajukan cuti/izin.",
                '/leave-requests/approval'
            ));
        }

        return back()->with('success', 'Pengajuan berhasil dikirim dan menunggu persetujuan.');
    }

    /**
     * Update a pending leave request (edit).
     */
    public function update(Request $request, LeaveRequest $leaveRequest)
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee || $leaveRequest->employee_id !== $employee->id) {
            abort(403, 'Anda tidak memiliki izin untuk mengedit pengajuan ini.');
        }

        if ($leaveRequest->status !== 'pending') {
            return back()->with('error', 'Hanya pengajuan dengan status "Menunggu" yang dapat diedit.');
        }

        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date' . ($request->duration_type === 'partial' ? '|same:start_date' : ''),
            'type' => 'required|in:cuti,izin,sakit,izin_pribadi,izin_dinas_luar,izin_pulang_cepat',
            'duration_type' => 'nullable|in:full_day,partial',
            'start_time' => 'required_if:duration_type,partial|nullable|date_format:H:i',
            'end_time' => 'required_if:duration_type,partial|nullable|date_format:H:i|after:start_time',
            'reason' => 'required|string|max:1000',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'remove_attachment' => 'nullable|boolean',
        ], [
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'end_date.required' => 'Tanggal selesai wajib diisi.',
            'end_date.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
            'end_date.same' => 'Pengajuan dengan rentang waktu harus di hari yang sama.',
            'type.required' => 'Jenis pengajuan wajib dipilih.',
            'start_time.required_if' => 'Jam mulai wajib diisi jika memilih rentang waktu.',
            'end_time.required_if' => 'Jam selesai wajib diisi jika memilih rentang waktu.',
            'end_time.after' => 'Jam selesai harus setelah jam mulai.',
            'reason.required' => 'Keterangan/alasan wajib diisi.',
            'attachment.mimes' => 'Lampiran harus berupa file JPG, PNG, atau PDF.',
            'attachment.max' => 'Ukuran lampiran maksimal 2 MB.',
        ]);

        $updateData = [
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'type' => $request->type,
            'duration_type' => $request->duration_type ?? 'full_day',
            'start_time' => $request->duration_type === 'partial' ? $request->start_time : null,
            'end_time' => $request->duration_type === 'partial' ? $request->end_time : null,
            'reason' => $request->reason,
        ];

        // Handle attachment removal
        if ($request->boolean('remove_attachment') && !$request->hasFile('attachment')) {
            if ($leaveRequest->attachment_path) {
                $disk = config('filesystems.default', 'public');
                Storage::disk($disk)->delete($leaveRequest->attachment_path);
            }
            $updateData['attachment_path'] = null;
            $updateData['attachment_name'] = null;
        }

        // Handle new attachment upload
        if ($request->hasFile('attachment')) {
            $disk = config('filesystems.default', 'public');
            // Delete old attachment
            if ($leaveRequest->attachment_path) {
                Storage::disk($disk)->delete($leaveRequest->attachment_path);
            }
            $file = $request->file('attachment');
            $updateData['attachment_name'] = $file->getClientOriginalName();
            $updateData['attachment_path'] = $file->store('leave-attachments', $disk);
        }

        $leaveRequest->update($updateData);

        return back()->with('success', 'Pengajuan berhasil diperbarui.');
    }

    /**
     * Approve a leave request.
     */
    public function approve(LeaveRequest $leaveRequest)
    {
        if (!$this->isApprover()) {
            abort(403, 'Anda tidak memiliki izin untuk menyetujui pengajuan.');
        }

        $leaveRequest->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
        ]);

        if ($leaveRequest->employee && $leaveRequest->employee->user) {
            $leaveRequest->employee->user->notify(new SystemNotification(
                'Pengajuan Disetujui',
                'Pengajuan cuti/izin Anda telah disetujui.',
                '/leave-requests'
            ));
        }

        return back()->with('success', 'Pengajuan telah disetujui.');
    }

    /**
     * Reject a leave request.
     */
    public function reject(LeaveRequest $leaveRequest)
    {
        if (!$this->isApprover()) {
            abort(403, 'Anda tidak memiliki izin untuk menolak pengajuan.');
        }

        $leaveRequest->update([
            'status' => 'rejected',
            'approved_by' => Auth::id(),
        ]);

        if ($leaveRequest->employee && $leaveRequest->employee->user) {
            $leaveRequest->employee->user->notify(new SystemNotification(
                'Pengajuan Ditolak',
                'Pengajuan cuti/izin Anda telah ditolak.',
                '/leave-requests'
            ));
        }

        return back()->with('success', 'Pengajuan telah ditolak.');
    }

    /**
     * Delete/cancel a pending leave request.
     */
    public function destroy(LeaveRequest $leaveRequest)
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee || $leaveRequest->employee_id !== $employee->id) {
            abort(403, 'Anda tidak memiliki izin untuk menghapus pengajuan ini.');
        }

        if ($leaveRequest->status !== 'pending') {
            return back()->with('error', 'Hanya pengajuan dengan status "Menunggu" yang dapat dibatalkan.');
        }

        if ($leaveRequest->attachment_path) {
            $disk = config('filesystems.default', 'public');
            Storage::disk($disk)->delete($leaveRequest->attachment_path);
        }

        $leaveRequest->delete();

        return back()->with('success', 'Pengajuan berhasil dibatalkan.');
    }

    /**
     * Delete/cancel any leave request by Approver / Super Admin.
     */
    public function destroyByAdmin(LeaveRequest $leaveRequest)
    {
        if (!$this->isApprover()) {
            abort(403, 'Anda tidak memiliki izin untuk menghapus pengajuan ini.');
        }

        if ($leaveRequest->attachment_path) {
            $disk = config('filesystems.default', 'public');
            Storage::disk($disk)->delete($leaveRequest->attachment_path);
        }

        $leaveRequest->delete();

        return back()->with('success', 'Pengajuan berhasil dihapus oleh Atasan.');
    }
}
