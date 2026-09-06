<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    private function isReadOnlyUser(): bool
    {
        $user = auth()->user();
        return $user && $user->hasRole('Kesiswaan');
    }

    private function getTeacherClassIds(): array
    {
        $user = auth()->user();
        if (!$user || !$user->hasRole('Guru')) {
            return [];
        }

        $employee = $user->employee;
        if (!$employee) {
            return [];
        }

        return SchoolClass::where('homeroom_teacher_id', $employee->id)->pluck('id')->toArray();
    }

    private function validateHomeroomTeacherAccess(): void
    {
        $user = auth()->user();
        if (!$user) return;

        $isGuru = $user->hasRole('Guru');
        $isManagementOrKesiswaan = $user->hasAnyRole(['Super Admin', 'Kepala Sekolah', 'Kurikulum', 'Absensi', 'Kesiswaan']);

        if ($isGuru && !$isManagementOrKesiswaan) {
            $teacherClassIds = $this->getTeacherClassIds();
            if (empty($teacherClassIds)) {
                abort(403, 'Akses ditolak. Menu ini hanya dapat diakses oleh Guru yang bertugas sebagai Wali Kelas.');
            }
        }
    }

    public function index(Request $request)
    {
        $this->validateHomeroomTeacherAccess();

        $search = $request->input('search');
        $classId = $request->input('class_id');
        $status = $request->input('status', 'active');

        $user = auth()->user();
        $isGuru = $user && $user->hasRole('Guru');
        $teacherClassIds = $this->getTeacherClassIds();

        $query = Student::with('schoolClass')
            ->when($isGuru && !empty($teacherClassIds), function ($q) use ($teacherClassIds) {
                $q->whereIn('school_class_id', $teacherClassIds);
            })
            ->when($search, function ($q, $search) {
                $q->where(function ($s) use ($search) {
                    $s->where('name', 'like', "%{$search}%")
                      ->orWhere('nis', 'like', "%{$search}%")
                      ->orWhere('nisn', 'like', "%{$search}%");
                });
            })
            ->when($classId, function ($q, $classId) {
                $q->where('school_class_id', $classId);
            })
            ->when($status !== 'all', function ($q) use ($status) {
                $q->where('status', $status);
            });

        $students = $query->orderBy('name')->paginate(50)->withQueryString();

        $classesQuery = SchoolClass::orderBy('name');
        if ($isGuru && !empty($teacherClassIds)) {
            $classesQuery->whereIn('id', $teacherClassIds);
        }
        $schoolClasses = $classesQuery->get(['id', 'name', 'level', 'major']);

        return Inertia::render('Students/Index', [
            'students' => $students,
            'schoolClasses' => $schoolClasses,
            'filters' => [
                'search' => $search,
                'class_id' => $classId,
                'status' => $status,
            ],
            'isReadOnly' => $this->isReadOnlyUser(),
            'isHomeroomTeacher' => $isGuru && !empty($teacherClassIds),
        ]);
    }

    public function store(Request $request)
    {
        if ($this->isReadOnlyUser()) {
            abort(403, 'Akses ditolak. Peran Kesiswaan sebatas Read-Only.');
        }

        $user = auth()->user();
        $teacherClassIds = $this->getTeacherClassIds();
        if ($user->hasRole('Guru')) {
            if (empty($teacherClassIds) || !in_array($request->school_class_id, $teacherClassIds)) {
                abort(403, 'Anda hanya dapat menambahkan siswa untuk kelas yang Anda ampu.');
            }
        }

        $validated = $request->validate([
            // Data Siswa Utama
            'nis' => 'required|string|max:50|unique:students,nis',
            'nisn' => 'nullable|string|max:50|unique:students,nisn',
            'name' => 'required|string|max:255',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'school_class_id' => 'required|exists:school_classes,id',
            'status' => 'required|in:active,graduated,moved',

            // Data Biodata Siswa
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
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:30|regex:/^[0-9]*$/',

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
        ]);

        $validated['qr_token'] = Student::generateQrToken($validated['nis']);

        Student::create($validated);

        return back()->with('message', 'Data siswa berhasil ditambahkan.');
    }

    public function update(Request $request, Student $student)
    {
        if ($this->isReadOnlyUser()) {
            abort(403, 'Akses ditolak. Peran Kesiswaan sebatas Read-Only.');
        }

        $user = auth()->user();
        $teacherClassIds = $this->getTeacherClassIds();
        if ($user->hasRole('Guru')) {
            if (empty($teacherClassIds) || !in_array($student->school_class_id, $teacherClassIds)) {
                abort(403, 'Anda hanya dapat mengedit siswa di kelas yang Anda ampu.');
            }
        }

        $validated = $request->validate([
            // Data Siswa Utama
            'nis' => ['required', 'string', 'max:50', Rule::unique('students', 'nis')->ignore($student->id)],
            'nisn' => ['nullable', 'string', 'max:50', Rule::unique('students', 'nisn')->ignore($student->id)],
            'name' => 'required|string|max:255',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'school_class_id' => 'required|exists:school_classes,id',
            'status' => 'required|in:active,graduated,moved',

            // Data Biodata Siswa
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
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:30|regex:/^[0-9]*$/',

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
        ]);

        if (empty($student->qr_token) || $student->nis !== $validated['nis']) {
            $validated['qr_token'] = Student::generateQrToken($validated['nis']);
        }

        $student->update($validated);

        return back()->with('message', 'Data siswa berhasil diperbarui.');
    }

    public function destroy(Student $student)
    {
        if ($this->isReadOnlyUser()) {
            abort(403, 'Akses ditolak. Peran Kesiswaan sebatas Read-Only.');
        }

        $user = auth()->user();
        $teacherClassIds = $this->getTeacherClassIds();
        if ($user->hasRole('Guru')) {
            if (empty($teacherClassIds) || !in_array($student->school_class_id, $teacherClassIds)) {
                abort(403, 'Anda hanya dapat menghapus siswa di kelas yang Anda ampu.');
            }
        }

        $student->delete();
        return back()->with('message', 'Data siswa berhasil dihapus.');
    }

    public function bulkDestroy(Request $request)
    {
        if ($this->isReadOnlyUser()) {
            abort(403, 'Akses ditolak. Peran Kesiswaan sebatas Read-Only.');
        }

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:students,id',
        ]);

        $user = auth()->user();
        $teacherClassIds = $this->getTeacherClassIds();

        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $user, $teacherClassIds) {
            $query = Student::whereIn('id', $request->ids);
            if ($user->hasRole('Guru')) {
                $query->whereIn('school_class_id', $teacherClassIds);
            }
            $query->delete();
        });

        return back()->with('message', count($request->ids) . ' data siswa berhasil dihapus.');
    }

    public function export(Request $request)
    {
        $this->validateHomeroomTeacherAccess();

        $classId = $request->input('class_id');
        $search = $request->input('search');

        $user = auth()->user();
        $teacherClassIds = $this->getTeacherClassIds();
        if ($user && $user->hasRole('Guru') && !empty($teacherClassIds)) {
            if (!$classId || !in_array($classId, $teacherClassIds)) {
                $classId = $teacherClassIds[0];
            }
        }

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\StudentsExport($classId, $search),
            'data-siswa.xlsx'
        );
    }

    public function downloadTemplate()
    {
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\StudentTemplateExport,
            'template-import-siswa.xlsx'
        );
    }

    public function import(Request $request)
    {
        if ($this->isReadOnlyUser()) {
            abort(403, 'Akses ditolak. Peran Kesiswaan sebatas Read-Only.');
        }

        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120'
        ]);

        try {
            $import = new \App\Imports\StudentsImport;
            \Maatwebsite\Excel\Facades\Excel::import($import, $request->file('file'));

            $parts = [];
            if ($import->successCount > 0) {
                $parts[] = "{$import->successCount} data siswa baru ditambahkan";
            }
            if ($import->updatedCount > 0) {
                $parts[] = "{$import->updatedCount} data diperbarui";
            }
            if ($import->skippedCount > 0) {
                $parts[] = "{$import->skippedCount} data dilewati";
            }

            $message = !empty($parts)
                ? 'Import selesai: ' . implode(', ', $parts) . '.'
                : 'Import selesai, tidak ada data yang diproses. Pastikan format file sesuai template.';

            if (!empty($import->errors)) {
                $message .= ' Detail info: ' . implode(' | ', array_slice($import->errors, 0, 5));
            }

            return back()->with('message', $message);
        } catch (\Throwable $e) {
            return back()->withErrors(['message' => 'Gagal mengimpor file Excel: ' . $e->getMessage()]);
        }
    }

    public function cards(Request $request)
    {
        $this->validateHomeroomTeacherAccess();

        $classId = $request->input('class_id');
        $search = $request->input('search');

        $user = auth()->user();
        $isGuru = $user && $user->hasRole('Guru');
        $teacherClassIds = $this->getTeacherClassIds();

        $query = Student::with('schoolClass')
            ->where('status', 'active')
            ->when($isGuru && !empty($teacherClassIds), function ($q) use ($teacherClassIds) {
                $q->whereIn('school_class_id', $teacherClassIds);
            })
            ->when($classId, function ($q, $classId) {
                $q->where('school_class_id', $classId);
            })
            ->when($search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('nis', 'like', "%{$search}%");
            });

        $students = $query->orderBy('name')->paginate(50)->withQueryString();

        $classesQuery = SchoolClass::orderBy('name');
        if ($isGuru && !empty($teacherClassIds)) {
            $classesQuery->whereIn('id', $teacherClassIds);
        }
        $schoolClasses = $classesQuery->get(['id', 'name']);

        return Inertia::render('Students/Cards', [
            'students' => $students,
            'schoolClasses' => $schoolClasses,
            'filters' => [
                'class_id' => $classId,
                'search' => $search,
            ],
            'isReadOnly' => $this->isReadOnlyUser(),
            'isHomeroomTeacher' => $isGuru && !empty($teacherClassIds),
        ]);
    }
}
