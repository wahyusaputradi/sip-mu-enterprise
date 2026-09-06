<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolClassController extends Controller
{
    private function isReadOnlyUser(): bool
    {
        $user = auth()->user();
        return $user && $user->hasRole('Kesiswaan');
    }

    public function index()
    {
        $classes = SchoolClass::with('homeroomTeacher')
            ->withCount('students')
            ->orderBy('name')
            ->get();

        $teachers = Employee::where('status', 'active')->orderBy('name')->get(['id', 'name']);

        return Inertia::render('SchoolClasses/Index', [
            'classes' => $classes,
            'teachers' => $teachers,
            'isReadOnly' => $this->isReadOnlyUser(),
        ]);
    }

    public function store(Request $request)
    {
        if ($this->isReadOnlyUser()) {
            abort(403, 'Akses ditolak. Peran Kesiswaan sebatas Read-Only.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:school_classes,name',
            'level' => 'nullable|string|max:20',
            'major' => 'nullable|string|max:100',
            'homeroom_teacher_id' => 'nullable|exists:employees,id',
        ]);

        SchoolClass::create($validated);

        return back()->with('message', 'Kelas berhasil ditambahkan.');
    }

    public function update(Request $request, SchoolClass $schoolClass)
    {
        if ($this->isReadOnlyUser()) {
            abort(403, 'Akses ditolak. Peran Kesiswaan sebatas Read-Only.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:school_classes,name,' . $schoolClass->id,
            'level' => 'nullable|string|max:20',
            'major' => 'nullable|string|max:100',
            'homeroom_teacher_id' => 'nullable|exists:employees,id',
        ]);

        $schoolClass->update($validated);

        return back()->with('message', 'Kelas berhasil diperbarui.');
    }

    public function destroy(SchoolClass $schoolClass)
    {
        if ($this->isReadOnlyUser()) {
            abort(403, 'Akses ditolak. Peran Kesiswaan sebatas Read-Only.');
        }

        if ($schoolClass->students()->count() > 0) {
            return back()->withErrors(['message' => 'Tidak dapat menghapus kelas yang masih memiliki data siswa.']);
        }

        $schoolClass->delete();

        return back()->with('message', 'Kelas berhasil dihapus.');
    }
}
