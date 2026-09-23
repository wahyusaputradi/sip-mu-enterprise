<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TeachingSchedule;
use App\Models\TeachingAttendance;
use Carbon\Carbon;

class AutoAttendTeachingHours extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:auto-attend-hours
                            {--date= : Tanggal presensi (format YYYY-MM-DD), contoh: 2026-09-11}
                            {--start-hour=8 : Jam ke mulai (1-10)}
                            {--end-hour=10 : Jam ke selesai (1-10)}
                            {--reason=Pulang Cepat : Alasan / Kebijakan Sekolah}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Otomatis mencatat presensi jam mengajar guru sebagai HADIR untuk tanggal dan rentang jam ke tertentu (misal kebijakan pulang cepat)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dateStr = $this->option('date') ?: Carbon::today()->format('Y-m-d');
        $startHour = (int) $this->option('start-hour');
        $endHour = (int) $this->option('end-hour');
        $reason = $this->option('reason');

        if ($startHour < 1 || $endHour > 10 || $startHour > $endHour) {
            $this->error("Rentang jam ke tidak valid. Nilai harus antara 1 s.d 10.");
            return 1;
        }

        try {
            $carbonDate = Carbon::parse($dateStr);
        } catch (\Exception $e) {
            $this->error("Format tanggal tidak valid. Gunakan YYYY-MM-DD.");
            return 1;
        }

        $dayOfWeek = $carbonDate->dayOfWeekIso; // 1 = Senin, 5 = Jumat
        if ($dayOfWeek > 5) {
            $this->warn("Tanggal {$dateStr} adalah hari libur akhir pekan (" . $carbonDate->translatedFormat('l') . ").");
        }

        $hoursRange = range($startHour, $endHour);
        $hourSlots = TeachingSchedule::hourSlots();

        $schedules = TeachingSchedule::with(['employee', 'schoolClass'])
            ->where('day_of_week', $dayOfWeek)
            ->whereIn('hour_number', $hoursRange)
            ->get();

        if ($schedules->isEmpty()) {
            $this->info("Tidak ditemukan jadwal mengajar untuk hari " . $carbonDate->translatedFormat('l') . " (Jam ke-{$startHour} s.d {$endHour}).");
            return 0;
        }

        $this->info("Memproses presensi otomatis untuk tanggal {$dateStr} (" . $carbonDate->translatedFormat('l') . ") jam ke-{$startHour} s.d {$endHour}...");
        $this->info("Alasan: {$reason}\n");

        $created = 0;
        $updated = 0;
        $processedTeachers = [];

        foreach ($schedules as $schedule) {
            $empId = $schedule->employee_id;
            $processedTeachers[$empId] = $schedule->employee->name ?? "ID: {$empId}";

            $slotTime = $hourSlots[$schedule->hour_number]['start'] ?? '12:00';
            if (strlen($slotTime) === 5) {
                $slotTime .= ':00';
            }

            $att = TeachingAttendance::where('employee_id', $empId)
                ->where('teaching_schedule_id', $schedule->id)
                ->where('date', $dateStr)
                ->first();

            if (!$att) {
                TeachingAttendance::create([
                    'employee_id' => $empId,
                    'teaching_schedule_id' => $schedule->id,
                    'date' => $dateStr,
                    'time' => $slotTime,
                    'photo' => null,
                    'latitude' => null,
                    'longitude' => null,
                    'campus_location_id' => null,
                    'status' => 'present',
                    'is_dinas_luar' => false,
                ]);
                $created++;
            } else {
                if ($att->status !== 'present') {
                    $att->update(['status' => 'present']);
                    $updated++;
                }
            }
        }

        $this->table(
            ['Metrik', 'Jumlah'],
            [
                ['Tanggal Perbaikan', $dateStr . " (" . $carbonDate->translatedFormat('l') . ")"],
                ['Rentang Jam Ke', "Jam ke-{$startHour} s.d Jam ke-{$endHour}"],
                ['Total Jadwal Mengajar Terproses', $schedules->count()],
                ['Total Guru Terdampak', count($processedTeachers)],
                ['Data Presensi Baru Dibuat', $created],
                ['Data Presensi Diperbarui', $updated],
            ]
        );

        $this->info("✅ Berhasil memproses presensi jam mengajar!");
        return 0;
    }
}
