<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AccountSettingsController extends Controller
{
    /**
     * Display the account settings form.
     */
    public function edit(Request $request)
    {
        return Inertia::render('Account/Edit', [
            'status' => session('status'),
            'user' => [
                'email' => $request->user()->email,
                'name' => $request->user()->name,
                'username' => $request->user()->username ?? '',
            ]
        ]);
    }

    /**
     * Update user credentials (email, username & password)
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'username' => [
                'nullable',
                'string',
                'min:3',
                'max:30',
                'regex:/^[a-zA-Z0-9._]+$/',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'password' => ['nullable', 'min:8', 'confirmed', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/'],
        ], [
            'current_password.current_password' => 'Password saat ini tidak sesuai.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan oleh akun lain.',
            'username.min' => 'Username minimal 3 karakter.',
            'username.max' => 'Username maksimal 30 karakter.',
            'username.regex' => 'Username hanya boleh berisi huruf, angka, titik, dan underscore.',
            'username.unique' => 'Username sudah digunakan oleh akun lain.',
            'password.min' => 'Password baru minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.',
        ]);

        $user->email = $validated['email'];

        // Sanitize & save username (lowercase, trimmed)
        if (!empty($validated['username'])) {
            $user->username = strtolower(trim($validated['username']));
        } else {
            $user->username = null;
        }

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->route('account.edit')->with('success', 'Pengaturan akun berhasil diperbarui.');
    }
}
