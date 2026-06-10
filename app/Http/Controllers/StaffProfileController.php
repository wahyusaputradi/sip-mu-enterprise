<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\Employee;
use App\Services\ImageCompressionService;

class StaffProfileController extends Controller
{
    public function edit()
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return redirect()->route('dashboard')->withErrors(['message' => 'Data pegawai tidak ditemukan.']);
        }

        $employee->load('user', 'positions');
        
        return Inertia::render('Profile/EditEmployee', [
            'employee' => $employee,
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return back()->withErrors(['message' => 'Data pegawai tidak ditemukan.']);
        }

        // Validate fields that the employee is allowed to edit.
        // Restricted fields (not validated/updated here): nik, nik_kependudukan, position_id, status, is_homeroom_teacher, homeroom_class, is_extracurricular_builder, extracurricular_name
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'nuptk' => 'nullable|string|max:255',
            'birth_place' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'phone' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:2048',
            'education' => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
            'ukg_number' => 'nullable|string|max:255',
            'teaching_hours' => 'nullable|integer',
        ]);

        // Update user email/name
        $user->update([
            'name' => $validated['name'],
            'email' => $request->email,
        ]);

        // Handle photo upload with compression
        $photoPath = $employee->photo_path;
        if ($request->hasFile('photo')) {
            $disk = config('filesystems.default', 'public');
            if ($photoPath && Storage::disk($disk)->exists($photoPath)) {
                Storage::disk($disk)->delete($photoPath);
            }
            $slugName = \Illuminate\Support\Str::slug($employee->name, '_');
            $photoFilename = "{$employee->nik}_{$slugName}";
            $compressor = app(ImageCompressionService::class);
            $photoPath = $compressor->compressFromUpload(
                $request->file('photo'),
                'employee-photos',
                $photoFilename,
                'profile'
            );
        }

        // Update employee data
        $employee->update([
            'name' => $validated['name'],
            'nuptk' => $validated['nuptk'] ?? null,
            'birth_place' => $validated['birth_place'] ?? null,
            'birth_date' => $validated['birth_date'] ?? null,
            'gender' => $validated['gender'],
            'phone' => $validated['phone'] ?? null,
            'photo_path' => $photoPath,
            'education' => $validated['education'] ?? null,
            'subject' => $validated['subject'] ?? null,
            'ukg_number' => $validated['ukg_number'] ?? null,
            'teaching_hours' => $validated['teaching_hours'] ?? null,
        ]);

        return redirect()->back()->with('message', 'Profil berhasil diperbarui.');
    }
}
