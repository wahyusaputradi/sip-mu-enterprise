<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserAuthorityController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->with(['employee.positions', 'roles']);

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $users = $query->paginate(50)->withQueryString()->through(function ($user) {
            return [
                'id' => $user->id,
                // Mengambil nama dari Data Pegawai jika ada, jika tidak gunakan nama User bawaan
                'name' => $user->employee ? $user->employee->name : $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'bypass_liveness' => (bool)$user->bypass_liveness,
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
        
        $roles = Role::all()->map(function($role) {
            return [
                'id' => $role->id,
                'name' => $role->name
            ];
        });

        return Inertia::render('UserAuthority/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only('search')
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'min:8'],
            'roles' => ['array'],
            'bypass_liveness' => ['nullable', 'boolean']
        ]);

        $dataToUpdate = [
            'email' => $request->email,
            'bypass_liveness' => $request->boolean('bypass_liveness')
        ];
        
        if ($request->filled('password')) {
            $dataToUpdate['password'] = Hash::make($request->password);
        }

        $user->update($dataToUpdate);

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        return redirect()->back()->with('success', 'Otoritas dan Akun pengguna berhasil diperbarui.');
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

        return redirect()->back()->with('success', 'Password pengguna terpilih berhasil direset ke default (password).');
    }
}
