<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Models\SpecialWorkday;
use App\Models\ExamDay;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SystemSettingController extends Controller
{
    public function index()
    {
        $settings = SystemSetting::all()->pluck('value', 'key');
        $holidays = \App\Models\Holiday::orderBy('date', 'desc')->get();
        $specialWorkdays = SpecialWorkday::orderBy('date', 'desc')->get();
        $examDays = ExamDay::orderBy('date', 'desc')->get();

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'holidays' => $holidays,
            'specialWorkdays' => $specialWorkdays,
            'examDays' => $examDays,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'school_name' => 'required|string|max:255',
            'jam_masuk' => 'required|date_format:H:i',
            'jam_keluar' => 'required|date_format:H:i',
            'batas_waktu_maksimal_terlambat' => 'required|integer|min:0',
            'buffer_presensi_masuk' => 'required|integer|min:0',
            'buffer_presensi_keluar' => 'required|integer|min:0',
            'teaching_late_tolerance' => 'required|integer|min:0',
            'count_holidays_as_present' => 'required|boolean',
            'liveness_detection_enabled' => 'required|boolean',
            'recap_cutoff_type' => 'required|in:calendar_month,custom_date',
            'recap_cutoff_day' => 'required_if:recap_cutoff_type,custom_date|nullable|integer|min:1|max:28',
            'student_jam_masuk_buka' => 'required|date_format:H:i',
            'student_jam_masuk' => 'required|date_format:H:i',
            'student_jam_pulang' => 'required|date_format:H:i',
            'student_jam_pulang_tutup' => 'required|date_format:H:i',
            'student_batas_terlambat_menit' => 'required|integer|min:0',
            'exam_mode_enabled' => 'nullable|boolean',
            'exam_mode_start_date' => 'nullable|date',
            'exam_mode_end_date' => 'nullable|date|after_or_equal:exam_mode_start_date',
            'exam_mode_jam_pulang' => 'required|date_format:H:i',
        ]);
        
        foreach ($validated as $key => $value) {
            $storeValue = is_bool($value) ? ($value ? '1' : '0') : $value;
            SystemSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $storeValue]
            );
        }

        return back()->with('message', 'Pengaturan berhasil diperbarui.');
    }

    public function storeSpecialWorkday(Request $request)
    {
        $request->validate([
            'date' => 'required|date|unique:special_workdays,date',
            'name' => 'required|string|max:255',
            'jam_keluar' => 'required|date_format:H:i',
            'disable_kbm' => 'required|boolean',
        ]);

        SpecialWorkday::create([
            'date' => $request->date,
            'name' => $request->name,
            'jam_keluar' => $request->jam_keluar,
            'disable_kbm' => (bool) $request->disable_kbm,
        ]);

        return back()->with('message', 'Hari kerja khusus berhasil ditambahkan.');
    }

    public function updateSpecialWorkday(Request $request, SpecialWorkday $specialWorkday)
    {
        $validated = $request->validate([
            'date' => [
                'required',
                'date',
                Rule::unique('special_workdays', 'date')->ignore($specialWorkday->id),
            ],
            'name' => 'required|string|max:255',
            'jam_keluar' => 'required|date_format:H:i',
            'disable_kbm' => 'required|boolean',
        ]);

        $specialWorkday->update([
            'date' => $validated['date'],
            'name' => $validated['name'],
            'jam_keluar' => $validated['jam_keluar'],
            'disable_kbm' => (bool) $validated['disable_kbm'],
        ]);

        return back()->with('message', 'Hari kerja khusus berhasil diperbarui.');
    }

    public function destroySpecialWorkday(SpecialWorkday $specialWorkday)
    {
        $specialWorkday->delete();
        return back()->with('message', 'Hari kerja khusus berhasil dihapus.');
    }

    public function storeExamDay(Request $request)
    {
        $request->validate([
            'mode' => 'required|in:single,range',
            'name' => 'required|string|max:255',
            'type' => 'required|in:uts,uas',
            'jam_keluar' => 'required|date_format:H:i',
            'date' => 'required_if:mode,single|nullable|date',
            'start_date' => 'required_if:mode,range|nullable|date',
            'end_date' => 'required_if:mode,range|nullable|date|after_or_equal:start_date',
        ]);

        $name = $request->name;
        $type = $request->type;
        $jamKeluar = $request->jam_keluar;

        if ($request->mode === 'single') {
            $date = \Carbon\Carbon::parse($request->date);
            ExamDay::updateOrCreate(
                ['date' => $date->format('Y-m-d')],
                [
                    'name' => $name,
                    'type' => $type,
                    'jam_keluar' => $jamKeluar,
                ]
            );
        } else {
            $start = \Carbon\Carbon::parse($request->start_date);
            $end = \Carbon\Carbon::parse($request->end_date);

            $current = $start->copy();
            while ($current->lte($end)) {
                ExamDay::updateOrCreate(
                    ['date' => $current->format('Y-m-d')],
                    [
                        'name' => $name,
                        'type' => $type,
                        'jam_keluar' => $jamKeluar,
                    ]
                );
                $current->addDay();
            }
        }

        return back()->with('message', 'Hari/Periode Ujian berhasil ditambahkan.');
    }

    public function updateExamDay(Request $request, ExamDay $examDay)
    {
        $validated = $request->validate([
            'date' => [
                'required',
                'date',
                Rule::unique('exam_days', 'date')->ignore($examDay->id),
            ],
            'name' => 'required|string|max:255',
            'type' => 'required|in:uts,uas',
            'jam_keluar' => 'required|date_format:H:i',
        ]);

        $examDay->update($validated);

        return back()->with('message', 'Hari Ujian berhasil diperbarui.');
    }

    public function destroyExamDay(ExamDay $examDay)
    {
        $examDay->delete();
        return back()->with('message', 'Hari Ujian berhasil dihapus.');
    }

    public function bulkDestroyExamDays(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:exam_days,id',
        ]);

        ExamDay::whereIn('id', $request->ids)->delete();

        return back()->with('message', 'Hari Ujian terpilih berhasil dihapus.');
    }
}

