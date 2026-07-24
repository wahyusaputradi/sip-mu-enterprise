<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Exports\EmployeesExport;
use App\Exports\EmployeeTemplateExport;
use App\Imports\EmployeesImport;
use Maatwebsite\Excel\Facades\Excel;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = Employee::with('positions')->orderBy('name', 'asc')->get()->map(function ($emp) {
            // Attach primary position name for easy display
            $emp->position_names = $emp->positions->pluck('name')->toArray();
            $emp->primary_position_name = $emp->positions->where('pivot.is_primary', true)->first()?->name ?? ($emp->positions->first()?->name ?? '-');
            return $emp;
        });
        return Inertia::render('Employees/Index', [
            'employees' => $employees
        ]);
    }

    public function create()
    {
        $positions = Position::all();
        return Inertia::render('Employees/Create', [
            'positions' => $positions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nik' => 'required|string|unique:employees,nik',
            'nik_kependudukan' => 'nullable|string|max:255',
            'position_ids' => 'required|array|min:1',
            'position_ids.*' => 'exists:positions,id',
            'primary_position_id' => 'required|exists:positions,id',
            'email' => 'nullable|email|unique:users,email',
            'status' => 'required|in:active,inactive',
            'nuptk' => 'nullable|string|max:255',
            'birth_place' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'phone' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:2048',
            'join_date' => 'nullable|date',
            'education' => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
            'ukg_number' => 'nullable|string|max:255',
            'teaching_hours' => 'nullable|integer',
            'is_homeroom_teacher' => 'boolean',
            'homeroom_class' => 'nullable|string|max:255',
            'is_extracurricular_builder' => 'boolean',
            'extracurricular_name' => 'nullable|string|max:255',
            'is_certified' => 'boolean',
        ]);

        $userId = null;
        if ($request->email) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make('password123'),
            ]);
            // Try to assign a default role based on primary position
            $primaryPos = Position::find($validated['primary_position_id']);
            $roleName = ($primaryPos && stripos($primaryPos->name, 'Guru') !== false) ? 'Guru' : 'Karyawan';
            
            try {
                $user->assignRole($roleName);
            } catch (\Exception $e) {
                // Ignore if role doesn't exist
            }
            $userId = $user->id;
        }

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $slugName = \Illuminate\Support\Str::slug($validated['name'], '_');
            $photoFilename = "{$validated['nik']}_{$slugName}";
            $compressor = app(ImageCompressionService::class);
            $photoPath = $compressor->compressFromUpload(
                $request->file('photo'),
                'employee-photos',
                $photoFilename,
                'profile'
            );
        }

        $employee = Employee::create([
            'user_id' => $userId,
            'nik' => $validated['nik'],
            'nik_kependudukan' => $validated['nik_kependudukan'] ?? null,
            'name' => $validated['name'],
            'status' => $validated['status'],
            'nuptk' => $validated['nuptk'] ?? null,
            'birth_place' => $validated['birth_place'] ?? null,
            'birth_date' => $validated['birth_date'] ?? null,
            'gender' => $validated['gender'],
            'phone' => $validated['phone'] ?? null,
            'photo_path' => $photoPath,
            'join_date' => $validated['join_date'] ?? null,
            'education' => $validated['education'] ?? null,
            'subject' => $validated['subject'] ?? null,
            'ukg_number' => $validated['ukg_number'] ?? null,
            'teaching_hours' => $validated['teaching_hours'] ?? null,
            'is_homeroom_teacher' => $validated['is_homeroom_teacher'] ?? false,
            'homeroom_class' => $validated['homeroom_class'] ?? null,
            'is_extracurricular_builder' => $validated['is_extracurricular_builder'] ?? false,
            'extracurricular_name' => $validated['extracurricular_name'] ?? null,
            'is_certified' => $validated['is_certified'] ?? false,
        ]);

        // Sync positions with pivot data
        $syncData = [];
        foreach ($validated['position_ids'] as $posId) {
            $syncData[$posId] = ['is_primary' => ($posId == $validated['primary_position_id'])];
        }
        $employee->positions()->sync($syncData);

        return redirect()->route('employees.index')->with('message', 'Pegawai berhasil ditambahkan.');
    }

    public function edit(Employee $employee)
    {
        $positions = Position::all();
        $employee->load('user', 'positions');
        
        // Prepare position_ids and primary_position_id for the frontend
        $employee->position_ids = $employee->positions->pluck('id')->toArray();
        $employee->primary_position_id = $employee->positions->where('pivot.is_primary', true)->first()?->id 
            ?? $employee->positions->first()?->id;
        
        return Inertia::render('Employees/Edit', [
            'employee' => $employee,
            'positions' => $positions
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nik' => 'required|string|unique:employees,nik,' . $employee->id,
            'nik_kependudukan' => 'nullable|string|max:255',
            'position_ids' => 'required|array|min:1',
            'position_ids.*' => 'exists:positions,id',
            'primary_position_id' => 'required|exists:positions,id',
            'email' => 'nullable|email|unique:users,email,' . optional($employee->user)->id,
            'status' => 'required|in:active,inactive',
            'nuptk' => 'nullable|string|max:255',
            'birth_place' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'phone' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:2048',
            'join_date' => 'nullable|date',
            'education' => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
            'ukg_number' => 'nullable|string|max:255',
            'teaching_hours' => 'nullable|integer',
            'is_homeroom_teacher' => 'boolean',
            'homeroom_class' => 'nullable|string|max:255',
            'is_extracurricular_builder' => 'boolean',
            'extracurricular_name' => 'nullable|string|max:255',
            'is_certified' => 'boolean',
        ]);

        if ($request->email) {
            if ($employee->user) {
                $employee->user->update([
                    'name' => $request->name,
                    'email' => $request->email,
                ]);
            } else {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make('password123'),
                ]);
                // Try to assign a default role based on primary position
                $primaryPos = Position::find($validated['primary_position_id']);
                $roleName = ($primaryPos && stripos($primaryPos->name, 'Guru') !== false) ? 'Guru' : 'Karyawan';
                
                try {
                    $user->assignRole($roleName);
                } catch (\Exception $e) {
                    // Ignore if role doesn't exist
                }
                $employee->user_id = $user->id;
            }
        }

        $photoPath = $employee->photo_path;
        if ($request->hasFile('photo')) {
            $disk = config('filesystems.default', 'public');
            if ($photoPath && Storage::disk($disk)->exists($photoPath)) {
                Storage::disk($disk)->delete($photoPath);
            }
            $slugName = \Illuminate\Support\Str::slug($validated['name'], '_');
            $photoFilename = "{$validated['nik']}_{$slugName}";
            $compressor = app(ImageCompressionService::class);
            $photoPath = $compressor->compressFromUpload(
                $request->file('photo'),
                'employee-photos',
                $photoFilename,
                'profile'
            );
        }

        $employee->update([
            'nik' => $validated['nik'],
            'nik_kependudukan' => $validated['nik_kependudukan'] ?? null,
            'name' => $validated['name'],
            'status' => $validated['status'],
            'nuptk' => $validated['nuptk'] ?? null,
            'birth_place' => $validated['birth_place'] ?? null,
            'birth_date' => $validated['birth_date'] ?? null,
            'gender' => $validated['gender'],
            'phone' => $validated['phone'] ?? null,
            'photo_path' => $photoPath,
            'join_date' => $validated['join_date'] ?? null,
            'education' => $validated['education'] ?? null,
            'subject' => $validated['subject'] ?? null,
            'ukg_number' => $validated['ukg_number'] ?? null,
            'teaching_hours' => $validated['teaching_hours'] ?? null,
            'is_homeroom_teacher' => $validated['is_homeroom_teacher'] ?? false,
            'homeroom_class' => $validated['homeroom_class'] ?? null,
            'is_extracurricular_builder' => $validated['is_extracurricular_builder'] ?? false,
            'extracurricular_name' => $validated['extracurricular_name'] ?? null,
            'is_certified' => $validated['is_certified'] ?? false,
        ]);

        // Sync positions with pivot data
        $syncData = [];
        foreach ($validated['position_ids'] as $posId) {
            $syncData[$posId] = ['is_primary' => ($posId == $validated['primary_position_id'])];
        }
        $employee->positions()->sync($syncData);

        return redirect()->route('employees.index')->with('message', 'Data pegawai berhasil diperbarui.');
    }

    public function destroy(Employee $employee)
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($employee) {
            $employee->purgeWithRelations();
        });

        return back()->with('message', 'Data pegawai beserta seluruh riwayat presensi dan berkasnya berhasil dihapus.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer|exists:employees,id']);

        \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            $employees = Employee::whereIn('id', $request->ids)->get();
            foreach ($employees as $employee) {
                $employee->purgeWithRelations();
            }
        });

        return back()->with('message', count($request->ids) . ' pegawai beserta seluruh riwayat presensi dan berkasnya berhasil dihapus.');
    }

    public function export()
    {
        return Excel::download(new EmployeesExport, 'data-pegawai.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120'
        ]);

        try {
            $import = new EmployeesImport;
            Excel::import($import, $request->file('file'));

            $parts = [];
            if ($import->successCount > 0) {
                $parts[] = "{$import->successCount} data baru ditambahkan";
            }
            if ($import->updatedCount > 0) {
                $parts[] = "{$import->updatedCount} data diperbarui";
            }
            if ($import->skippedCount > 0) {
                $parts[] = "{$import->skippedCount} data dilewati karena error";
            }

            $message = !empty($parts)
                ? 'Import selesai: ' . implode(', ', $parts) . '.'
                : 'Import selesai, tetapi tidak ada data yang diproses. Pastikan format file sesuai template.';

            if (!empty($import->errors)) {
                $message .= ' Detail error: ' . implode(' | ', array_slice($import->errors, 0, 5));
            }

            $type = ($import->successCount > 0 || $import->updatedCount > 0) ? 'message' : 'error';

            return back()->with($type, $message);

        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mengimpor data: ' . $e->getMessage());
        }
    }

    public function template()
    {
        return Excel::download(new EmployeeTemplateExport, 'template-import-pegawai.xlsx');
    }
}
