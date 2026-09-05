<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserAuthorityController extends Controller
{
    public function index(Request $request)
    {
        $activeTab = $request->input('tab', 'employees');

        // ═══ TAB 1: PEGAWAI / GURU / KARYAWAN ═══
        $employeeQuery = User::query()->with(['employee.positions', 'roles']);

        if ($request->filled('search') && $activeTab === 'employees') {
            $search = $request->search;
            $employeeQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $users = $employeeQuery->paginate(50)->withQueryString()->through(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->employee ? $user->employee->name : $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'bypass_liveness' => (bool)$user->bypass_liveness,
                'bypass_geofencing' => (bool)$user->bypass_geofencing,
                'roles' => $user->roles->pluck('name'),
                'employee' => $user->employee ? [
                    'position' => $user->employee->positions->where('pivot.is_primary', true)->first() ? [
                        'name' => $user->employee->positions->where('pivot.is_primary', true)->first()?->name
                    ] : ($user->employee->positions->first() ? [
                        'name' => $user->employee->positions->first()?->name
                    ] : null)
                ] : null,
            ];
        });

        $employeeStats = [
            'total_users'       => User::count(),
            'total_super_admin' => User::role('Super Admin')->count(),
            'total_guru'        => User::role('Guru')->count(),
            'total_bypassed'    => User::where('bypass_liveness', true)->orWhere('bypass_geofencing', true)->count(),
        ];

        $roles = Role::all()->map(function($role) {
            return [
                'id' => $role->id,
                'name' => $role->name
            ];
        });

        // ═══ TAB 2: SISWA-SISWI ═══
        $studentQuery = Student::with('schoolClass:id,name')->latest();

        if ($request->filled('search') && $activeTab === 'students') {
            $search = $request->search;
            $studentQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nis', 'like', "%{$search}%")
                  ->orWhere('parent_phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('class_id') && $activeTab === 'students') {
            $studentQuery->where('school_class_id', $request->class_id);
        }

        if ($request->filled('status') && $activeTab === 'students') {
            $studentQuery->where('status', $request->status);
        }

        $students = $studentQuery->paginate(50)->withQueryString();

        $studentStats = [
            'total_students'       => Student::count(),
            'active_students'      => Student::where('status', 'active')->count(),
            'inactive_students'    => Student::whereIn('status', ['inactive', 'graduated', 'moved'])->count(),
            'qr_token_registered'  => Student::whereNotNull('qr_token')->count(),
        ];

        $classes = SchoolClass::orderBy('name')->get(['id', 'name']);

        return Inertia::render('UserAuthority/Index', [
            'users'         => $users,
            'roles'         => $roles,
            'employeeStats' => $employeeStats,
            'students'      => $students,
            'studentStats'  => $studentStats,
            'classes'       => $classes,
            'activeTab'     => $activeTab,
            'filters'       => $request->only(['search', 'class_id', 'status', 'tab']),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'min:8'],
            'roles' => ['array'],
            'bypass_liveness' => ['nullable', 'boolean'],
            'bypass_geofencing' => ['nullable', 'boolean']
        ]);

        $dataToUpdate = [
            'email' => $request->email,
            'bypass_liveness' => $request->boolean('bypass_liveness'),
            'bypass_geofencing' => $request->boolean('bypass_geofencing')
        ];
        
        if ($request->filled('password')) {
            $dataToUpdate['password'] = Hash::make($request->password);
        }

        $user->update($dataToUpdate);

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        return redirect()->back()->with('success', 'Otoritas dan Akun pegawai berhasil diperbarui.');
    }

    public function bulkResetPassword(Request $request)
    {
        $request->validate([
            'user_ids' => ['required', 'array'],
            'user_ids.*' => ['exists:users,id']
        ]);

        $defaultPassword = Hash::make('password');

        User::whereIn('id', $request->user_ids)->update([
            'password' => $defaultPassword
        ]);

        return redirect()->back()->with('success', 'Password pegawai terpilih berhasil direset ke default (password).');
    }

    /**
     * Update Student Authority / Access Status & Credentials
     */
    public function updateStudent(Request $request, Student $student)
    {
        $validated = $request->validate([
            'status'        => 'required|in:active,inactive,graduated,moved',
            'parent_phone'  => 'nullable|string|max:30',
            'regenerate_qr' => 'nullable|boolean',
        ]);

        $updateData = [
            'status'       => $validated['status'],
            'parent_phone' => $validated['parent_phone'] ?? $student->parent_phone,
        ];

        if ($request->boolean('regenerate_qr')) {
            $updateData['qr_token'] = Student::generateQrToken($student->nis);
        }

        $student->update($updateData);

        return redirect()->back()->with('success', 'Otoritas dan kredensial siswa ' . $student->name . ' berhasil diperbarui.');
    }

    /**
     * Bulk Regenerate Student QR Tokens
     */
    public function bulkRegenerateQrToken(Request $request)
    {
        $request->validate([
            'student_ids'   => 'required|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        $students = Student::whereIn('id', $request->student_ids)->get();
        foreach ($students as $student) {
            $student->update([
                'qr_token' => Student::generateQrToken($student->nis),
            ]);
        }

        return redirect()->back()->with('success', 'QR Token untuk ' . count($students) . ' siswa terpilih berhasil di-regenerate.');
    }

    /**
     * Bulk Update Student Status
     */
    public function bulkUpdateStudentStatus(Request $request)
    {
        $validated = $request->validate([
            'student_ids'   => 'required|array',
            'student_ids.*' => 'exists:students,id',
            'status'        => 'required|in:active,inactive,graduated,moved',
        ]);

        Student::whereIn('id', $validated['student_ids'])->update([
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Status akses untuk ' . count($validated['student_ids']) . ' siswa terpilih berhasil diperbarui.');
    }

    /**
     * Auto Sync & Generate User Accounts for Students
     */
    public function syncStudentAccounts(Request $request)
    {
        Role::firstOrCreate(['name' => 'Siswa', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Wali Murid', 'guard_name' => 'web']);

        $students = Student::all();
        $createdCount = 0;
        $defaultPassword = Hash::make('password');

        foreach ($students as $student) {
            if (empty($student->nis)) continue;

            $user = User::where('username', $student->nis)
                ->orWhere('email', $student->nis . '@siswa.smkmu.sch.id')
                ->orWhere('email', $student->nis . '@siswa.sipmu.sch.id')
                ->first();

            if (!$user) {
                $user = User::create([
                    'name' => $student->name,
                    'username' => $student->nis,
                    'email' => $student->nis . '@siswa.smkmu.sch.id',
                    'password' => $defaultPassword,
                ]);
                $user->assignRole('Siswa');
                $createdCount++;
            } else {
                if ($user->email === $student->nis . '@siswa.sipmu.sch.id' || str_contains($user->email, '@siswa.sipmu.sch.id')) {
                    $user->update(['email' => $student->nis . '@siswa.smkmu.sch.id']);
                }
                if (!$user->hasRole('Siswa')) {
                    $user->assignRole('Siswa');
                }
            }

            if ($student->user_id !== $user->id) {
                $student->update(['user_id' => $user->id]);
            }
        }

        return redirect()->back()->with('success', "Sinkronisasi akun siswa berhasil. {$createdCount} akun baru terbuat, seluruh data siswa terhubung.");
    }
}
