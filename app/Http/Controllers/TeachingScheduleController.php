<?php

namespace App\Http\Controllers;

use App\Models\TeachingSchedule;
use App\Models\SchoolClass;
use App\Models\Employee;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TeachingScheduleExport;
use App\Imports\TeachingScheduleImport;
use App\Exports\SchoolClassExport;
use App\Imports\SchoolClassImport;

class TeachingScheduleController extends Controller
{
    public function index(Request $request)
    {
        $teachers = Employee::with('positions')
            ->where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'subject' => $t->subject,
                'position' => $t->positions->where('pivot.is_primary', true)->first()?->name ?? ($t->positions->first()?->name ?? '-'),
            ]);

        $schoolClasses = SchoolClass::orderBy('order')->orderBy('name')->get();

        $schedules = TeachingSchedule::with(['employee', 'schoolClass'])->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'employee_id' => $s->employee_id,
                'school_class_id' => $s->school_class_id,
                'class_name' => $s->schoolClass->name,
                'day_of_week' => $s->day_of_week,
                'hour_number' => $s->hour_number,
                'subject' => $s->subject,
                'teacher_name' => $s->employee->name ?? '-',
            ]);

        // Today's monitoring data
        $todayDow = Carbon::now()->dayOfWeekIso; // 1=Mon, 7=Sun
        $todayHoliday = \App\Models\Holiday::whereDate('date', Carbon::today())->first();
        $isHoliday = (bool) $todayHoliday;
        $todaySpecialWorkday = \App\Models\SpecialWorkday::whereDate('date', Carbon::today())->first();
        $isSpecialWorkday = $todaySpecialWorkday && $todaySpecialWorkday->disable_kbm;

        $todaySchedules = [];
        $monitorStats = ['total' => 0, 'filled' => 0, 'empty' => 0];

        if (!$isHoliday && !$isSpecialWorkday && $todayDow >= 1 && $todayDow <= 5) {
            $todayTeachingAttendances = \App\Models\TeachingAttendance::whereDate('date', Carbon::today())
                ->pluck('teaching_schedule_id')
                ->toArray();

            $todayRecords = TeachingSchedule::with(['employee.positions', 'schoolClass'])
                ->where('day_of_week', $todayDow)
                ->orderBy('hour_number')
                ->get();

            foreach ($todayRecords as $rec) {
                $hasAttended = in_array($rec->id, $todayTeachingAttendances);
                $todaySchedules[] = [
                    'id' => $rec->id,
                    'hour_number' => $rec->hour_number,
                    'subject' => $rec->subject,
                    'class_name' => $rec->schoolClass->name,
                    'teacher_name' => $rec->employee->name,
                    'teacher_position' => $rec->employee->positions->where('pivot.is_primary', true)->first()?->name ?? ($rec->employee->positions->first()?->name ?? '-'),
                    'employee_id' => $rec->employee_id,
                    'has_attended' => $hasAttended,
                ];
                $monitorStats['total']++;
                if ($hasAttended) {
                    $monitorStats['filled']++;
                } else {
                    $monitorStats['empty']++;
                }
            }
        }

        return Inertia::render('TeachingSchedules/Index', [
            'teachers' => $teachers,
            'schoolClasses' => $schoolClasses,
            'schedules' => $schedules,
            'hourSlots' => TeachingSchedule::hourSlots(),
            'dayLabels' => TeachingSchedule::dayLabels(),
            'todaySchedules' => $todaySchedules,
            'monitorStats' => $monitorStats,
            'todayDow' => $todayDow,
            'isHoliday' => $isHoliday,
            'holidayInfo' => $todayHoliday ? [
                'description' => $todayHoliday->description,
                'is_national_holiday' => (bool) $todayHoliday->is_national_holiday,
            ] : null,
            'isSpecialWorkday' => $isSpecialWorkday,
            'specialWorkdayInfo' => $todaySpecialWorkday ? [
                'name' => $todaySpecialWorkday->name,
                'jam_keluar' => $todaySpecialWorkday->jam_keluar,
                'disable_kbm' => $todaySpecialWorkday->disable_kbm,
            ] : null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'day_of_week' => 'required|integer|min:1|max:5',
            'hour_number' => 'required|integer|min:1|max:10',
            'subject' => 'required|string|max:100',
        ]);

        // Check teacher collision
        $teacherCollision = TeachingSchedule::where('employee_id', $request->employee_id)
            ->where('day_of_week', $request->day_of_week)
            ->where('hour_number', $request->hour_number)
            ->first();

        if ($teacherCollision) {
            return back()->withErrors(['message' => 'Guru ini sudah memiliki jadwal di hari & jam yang sama.']);
        }

        // Check class collision
        $classCollision = TeachingSchedule::where('school_class_id', $request->school_class_id)
            ->where('day_of_week', $request->day_of_week)
            ->where('hour_number', $request->hour_number)
            ->first();

        if ($classCollision) {
            return back()->withErrors(['message' => 'Kelas ini sudah digunakan oleh guru lain di hari & jam yang sama.']);
        }

        TeachingSchedule::create($request->only([
            'employee_id', 'school_class_id', 'day_of_week', 'hour_number', 'subject'
        ]));

        return back()->with('message', 'Jadwal berhasil ditambahkan.');
    }

    public function update(Request $request, TeachingSchedule $teachingSchedule)
    {
        $request->validate([
            'school_class_id' => 'required|exists:school_classes,id',
            'subject' => 'required|string|max:100',
        ]);

        // Check class collision (exclude self)
        $classCollision = TeachingSchedule::where('school_class_id', $request->school_class_id)
            ->where('day_of_week', $teachingSchedule->day_of_week)
            ->where('hour_number', $teachingSchedule->hour_number)
            ->where('id', '!=', $teachingSchedule->id)
            ->first();

        if ($classCollision) {
            return back()->withErrors(['message' => 'Kelas ini sudah digunakan oleh guru lain di hari & jam yang sama.']);
        }

        $teachingSchedule->update($request->only(['school_class_id', 'subject']));

        return back()->with('message', 'Jadwal berhasil diperbarui.');
    }

    public function destroy(TeachingSchedule $teachingSchedule)
    {
        $teachingSchedule->delete();
        return back()->with('message', 'Jadwal berhasil dihapus.');
    }

    public function export(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
        ]);
        
        $employee = Employee::findOrFail($request->employee_id);
        $fileName = 'Jadwal_Mengajar_' . str_replace(' ', '_', $employee->name) . '.xlsx';
        
        return Excel::download(new TeachingScheduleExport($request->employee_id), $fileName);
    }

    public function import(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'file' => 'required|mimes:xlsx,xls,csv|max:2048',
        ]);

        $import = new TeachingScheduleImport($request->employee_id);
        Excel::import($import, $request->file('file'));

        $errors = $import->getErrors();
        if (count($errors) > 0) {
            return back()->with('error', 'Impor selesai dengan beberapa peringatan: ' . implode(', ', $errors));
        }

        return back()->with('message', 'Jadwal berhasil diimpor.');
    }

    // School Classes CRUD
    public function classIndex()
    {
        $classes = SchoolClass::with('homeroomTeacher')->orderBy('order')->orderBy('name')->get();
        $teachers = Employee::where('status', 'active')
            ->orderBy('name')
            ->get();
            
        return Inertia::render('TeachingSchedules/Classes', [
            'classes' => $classes,
            'teachers' => $teachers,
        ]);
    }

    public function classTemplate()
    {
        return Excel::download(new SchoolClassExport(true), 'Template_Data_Kelas.xlsx');
    }

    public function classExport()
    {
        return Excel::download(new SchoolClassExport(false), 'Data_Kelas.xlsx');
    }

    public function classImport(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:2048',
        ]);

        Excel::import(new SchoolClassImport, $request->file('file'));

        return back()->with('message', 'Data kelas berhasil diimpor.');
    }

    public function classStore(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:school_classes,name',
            'level' => 'nullable|string|max:10',
            'major' => 'nullable|string|max:50',
            'homeroom_teacher_id' => 'nullable|exists:employees,id',
        ]);

        SchoolClass::create($request->only(['name', 'level', 'major', 'homeroom_teacher_id']));

        return back()->with('message', 'Kelas berhasil ditambahkan.');
    }

    public function classUpdate(Request $request, SchoolClass $schoolClass)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:school_classes,name,' . $schoolClass->id,
            'level' => 'nullable|string|max:10',
            'major' => 'nullable|string|max:50',
            'homeroom_teacher_id' => 'nullable|exists:employees,id',
        ]);

        $schoolClass->update($request->only(['name', 'level', 'major', 'homeroom_teacher_id']));

        return back()->with('message', 'Kelas berhasil diperbarui.');
    }

    public function classDestroy(SchoolClass $schoolClass)
    {
        if ($schoolClass->teachingSchedules()->count() > 0) {
            return back()->withErrors(['message' => 'Kelas ini masih digunakan di jadwal mengajar dan tidak bisa dihapus.']);
        }

        $schoolClass->delete();
        return back()->with('message', 'Kelas berhasil dihapus.');
    }

    /**
     * Bulk delete school classes
     */
    public function classBulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:school_classes,id'
        ]);

        $classes = SchoolClass::withCount('teachingSchedules')->whereIn('id', $request->ids)->get();

        $protected = $classes->filter(fn($c) => $c->teaching_schedules_count > 0);

        if ($protected->isNotEmpty()) {
            $names = $protected->pluck('name')->join(', ');
            return back()->with('error', "Kelas berikut tidak dapat dihapus karena masih digunakan di jadwal mengajar: {$names}.");
        }

        SchoolClass::whereIn('id', $request->ids)->delete();

        return back()->with('message', count($request->ids) . ' kelas berhasil dihapus.');
    }
}
