<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Models\SpecialWorkday;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemSettingController extends Controller
{
    public function index()
    {
        $settings = SystemSetting::all()->pluck('value', 'key');
        $holidays = \App\Models\Holiday::orderBy('date', 'desc')->get();
        $specialWorkdays = SpecialWorkday::orderBy('date', 'desc')->get();

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'holidays' => $holidays,
            'specialWorkdays' => $specialWorkdays,
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

    public function destroySpecialWorkday(SpecialWorkday $specialWorkday)
    {
        $specialWorkday->delete();
        return back()->with('message', 'Hari kerja khusus berhasil dihapus.');
    }
}

