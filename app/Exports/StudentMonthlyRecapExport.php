<?php

namespace App\Exports;

use App\Models\Student;
use App\Models\StudentAttendance;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;

class StudentMonthlyRecapExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected int $month;
    protected int $year;
    protected $classId;

    public function __construct(int $month = null, int $year = null, $classId = null)
    {
        $this->month = $month ?: Carbon::now()->month;
        $this->year = $year ?: Carbon::now()->year;
        $this->classId = $classId;
    }

    public function collection()
    {
        $students = Student::with(['schoolClass', 'attendances' => function ($q) {
            $q->whereMonth('date', $this->month)
              ->whereYear('date', $this->year);
        }])
        ->where('status', 'active')
        ->when($this->classId, fn($q, $c) => $q->where('school_class_id', $c))
        ->orderBy('name')
        ->get();

        return $students->map(function ($s) {
            $atts = $s->attendances;
            return (object) [
                'nis' => $s->nis,
                'name' => $s->name,
                'class_name' => $s->schoolClass?->name ?? '-',
                'present' => $atts->where('check_in_status', 'present')->count(),
                'late' => $atts->where('check_in_status', 'late')->count(),
                'sick' => $atts->where('check_in_status', 'sick')->count(),
                'permit' => $atts->where('check_in_status', 'permit')->count(),
                'alpha' => $atts->where('check_in_status', 'alpha')->count(),
            ];
        });
    }

    public function headings(): array
    {
        $monthName = Carbon::create()->month($this->month)->translatedFormat('F');
        return [
            'NIS',
            'Nama Siswa',
            'Kelas / Rombel',
            "Hadir Tepat Waktu ({$monthName} {$this->year})",
            "Terlambat ({$monthName} {$this->year})",
            "Sakit ({$monthName} {$this->year})",
            "Izin ({$monthName} {$this->year})",
            "Alpha ({$monthName} {$this->year})",
        ];
    }

    public function map($row): array
    {
        return [
            $row->nis,
            $row->name,
            $row->class_name,
            $row->present,
            $row->late,
            $row->sick,
            $row->permit,
            $row->alpha,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4F46E5'], // Indigo 600
                ],
            ],
        ];
    }
}
