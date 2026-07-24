<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Attendance;
use App\Models\TeachingAttendance;
use App\Models\LeaveRequest;

class MediaStreamController extends Controller
{
    /**
     * Stream protected media files from storage (local or cloud).
     */
    public function stream(Request $request)
    {
        $path = $request->query('path');
        if (!$path) {
            abort(400, 'Path is required.');
        }

        $disk = config('filesystems.default', 'public');

        if (!Storage::disk($disk)->exists($path)) {
            abort(404, 'File not found.');
        }

        $user = auth()->user();
        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        // Authorization check for sensitive photos (attendance and teaching) and leave attachments
        $isAdmin = $user->hasAnyRole(['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi']);
        $isSensitive = str_starts_with($path, 'attendances/') || 
                       str_starts_with($path, 'teaching/');
        
        if ($isSensitive && !$isAdmin) {
            $employee = $user->employee;
            if (!$employee) {
                abort(403, 'Unauthorized.');
            }

            // Check if the file belongs to the logged-in employee
            $isOwner = Attendance::where('employee_id', $employee->id)
                ->where(function ($q) use ($path) {
                    $q->where('photo_check_in', $path)
                      ->orWhere('photo_check_out', $path);
                })->exists() || TeachingAttendance::where('employee_id', $employee->id)
                ->where('photo', $path)->exists();

            if (!$isOwner) {
                abort(403, 'Unauthorized.');
            }
        }

        // Special authorization check for leave request attachments
        if (str_starts_with($path, 'leave-attachments/')) {
            $isLeaveAdmin = $user->hasAnyRole(['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi', 'Bendahara']);
            if (!$isLeaveAdmin) {
                $employee = $user->employee;
                if (!$employee) {
                    abort(403, 'Unauthorized.');
                }

                $isOwner = LeaveRequest::where('employee_id', $employee->id)
                    ->where('attachment_path', $path)
                    ->exists();

                if (!$isOwner) {
                    abort(403, 'Unauthorized.');
                }
            }
        }

        try {
            $file = Storage::disk($disk)->get($path);
            $mimeType = Storage::disk($disk)->mimeType($path) ?: 'image/jpeg';

            return response($file, 200)
                ->header('Content-Type', $mimeType)
                ->header('Cache-Control', 'public, max-age=86400');
        } catch (\Throwable $e) {
            abort(500, 'Failed to retrieve media file.');
        }
    }
}
