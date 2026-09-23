<?php

namespace App\Http\Controllers;

use App\Models\ExamSupervisionSchedule;
use App\Models\TeachingSchedule;
use App\Models\SchoolClass;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ExamSupervisionScheduleController extends Controller
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

        $schedules = ExamSupervisionSchedule::with(['employee', 'schoolClass'])->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'employee_id' => $s->employee_id,
                'school_class_id' => $s->school_class_id,
                'class_name' => $s->schoolClass->name ?? '-',
                'day_of_week' => $s->day_of_week,
                'session_number' => $s->session_number,
                'subject' => $s->subject,
                'room_name' => $s->room_name ?? ($s->schoolClass->name ?? '-'),
                'teacher_name' => $s->employee->name ?? '-',
            ]);

        $isExamMode = TeachingSchedule::isExamMode();

        // Monitor Tab Data
        $today = \Carbon\Carbon::today();
        $todayDow = $today->dayOfWeekIso;
        $todayHoliday = \App\Models\Holiday::where('date', $today->toDateString())->first();
        $todaySpecialWorkday = \App\Models\SpecialWorkday::where('date', $today->toDateString())->first();
        $isHoliday = (bool) $todayHoliday;
        $isSpecialWorkday = $todaySpecialWorkday && $todaySpecialWorkday->disable_kbm;

        $todaySchedules = [];
        $monitorStats = ['total' => 0, 'filled' => 0, 'empty' => 0];

        if (!$isHoliday && !$isSpecialWorkday && $todayDow >= 1 && $todayDow <= 5) {
            $todayExamAttendances = \App\Models\ExamSupervisionAttendance::whereDate('date', $today)
                ->pluck('exam_supervision_schedule_id')
                ->toArray();

            $todayRecords = ExamSupervisionSchedule::with(['employee.positions', 'schoolClass'])
                ->where('day_of_week', $todayDow)
                ->orderBy('session_number')
                ->get();

            foreach ($todayRecords as $rec) {
                $hasAttended = in_array($rec->id, $todayExamAttendances);
                $todaySchedules[] = [
                    'id' => $rec->id,
                    'session_number' => $rec->session_number,
                    'subject' => $rec->subject,
                    'class_name' => $rec->schoolClass->name ?? '-',
                    'room_name' => $rec->room_name ?? ($rec->schoolClass->name ?? '-'),
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

        return Inertia::render('ExamSchedules/Index', [
            'teachers' => $teachers,
            'schoolClasses' => $schoolClasses,
            'schedules' => $schedules,
            'sessionSlots' => ExamSupervisionSchedule::sessionSlots(),
            'dayLabels' => TeachingSchedule::dayLabels(),
            'isExamMode' => $isExamMode,
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
            'school_class_id' => 'nullable|exists:school_classes,id',
            'day_of_week' => 'required|integer|min:1|max:5',
            'session_number' => 'required|integer|min:1|max:4',
            'subject' => 'required|string|max:100',
            'room_name' => 'nullable|string|max:100',
        ]);

        // Check teacher collision on same day & session
        $teacherCollision = ExamSupervisionSchedule::where('employee_id', $request->employee_id)
            ->where('day_of_week', $request->day_of_week)
            ->where('session_number', $request->session_number)
            ->first();

        if ($teacherCollision) {
            return back()->withErrors(['message' => 'Guru ini sudah memiliki jadwal mengawas di hari & sesi yang sama.']);
        }

        ExamSupervisionSchedule::create([
            'employee_id' => $request->employee_id,
            'school_class_id' => $request->school_class_id,
            'day_of_week' => $request->day_of_week,
            'session_number' => $request->session_number,
            'subject' => $request->subject,
            'room_name' => $request->room_name,
        ]);

        return back()->with('message', 'Jadwal pengawas ujian berhasil ditambahkan.');
    }

    public function update(Request $request, ExamSupervisionSchedule $examSchedule)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'school_class_id' => 'nullable|exists:school_classes,id',
            'day_of_week' => 'required|integer|min:1|max:5',
            'session_number' => 'required|integer|min:1|max:4',
            'subject' => 'required|string|max:100',
            'room_name' => 'nullable|string|max:100',
        ]);

        // Check teacher collision on same day & session
        $teacherCollision = ExamSupervisionSchedule::where('employee_id', $request->employee_id)
            ->where('day_of_week', $request->day_of_week)
            ->where('session_number', $request->session_number)
            ->where('id', '!=', $examSchedule->id)
            ->first();

        if ($teacherCollision) {
            return back()->withErrors(['message' => 'Guru ini sudah memiliki jadwal mengawas di hari & sesi yang sama.']);
        }

        $examSchedule->update([
            'employee_id' => $request->employee_id,
            'school_class_id' => $request->school_class_id,
            'day_of_week' => $request->day_of_week,
            'session_number' => $request->session_number,
            'subject' => $request->subject,
            'room_name' => $request->room_name,
        ]);

        return back()->with('message', 'Jadwal pengawas ujian berhasil diperbarui.');
    }

    public function destroy(ExamSupervisionSchedule $examSchedule)
    {
        $examSchedule->delete();
        return back()->with('message', 'Jadwal pengawas ujian berhasil dihapus.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:exam_supervision_schedules,id',
        ]);

        ExamSupervisionSchedule::whereIn('id', $request->ids)->delete();

        return back()->with('message', count($request->ids) . ' Jadwal pengawas ujian berhasil dihapus.');
    }

    public function export(Request $request)
    {
        $employeeId = $request->query('employee_id');
        $fileName = 'Jadwal_Pengawas_Ujian';
        
        if ($employeeId) {
            $employee = Employee::find($employeeId);
            if ($employee) {
                $fileName .= '_' . str_replace(' ', '_', $employee->name);
            }
        }
        $fileName .= '.xlsx';

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\ExamSupervisionScheduleExport($employeeId),
            $fileName
        );
    }

    public function template()
    {
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\ExamSupervisionScheduleExport(null, true),
            'Template_Jadwal_Pengawas_Ujian.xlsx'
        );
    }

    public function import(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'file' => 'required|mimes:xlsx,xls,csv|max:2048',
        ]);

        $import = new \App\Imports\ExamSupervisionScheduleImport($request->employee_id);
        \Maatwebsite\Excel\Facades\Excel::import($import, $request->file('file'));

        $errors = $import->getErrors();
        if (count($errors) > 0) {
            return back()->with('error', 'Impor selesai dengan beberapa peringatan: ' . implode(', ', $errors));
        }

        return back()->with('message', 'Jadwal pengawas ujian berhasil diimpor.');
    }
}
