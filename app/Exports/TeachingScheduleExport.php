<?php

namespace App\Exports;

use App\Models\TeachingSchedule;
use App\Models\Employee;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class TeachingScheduleExport implements FromCollection, WithHeadings, ShouldAutoSize, WithTitle, WithEvents
{
    protected $employee_id;

    public function __construct($employee_id)
    {
        $this->employee_id = $employee_id;
    }

    public function headings(): array
    {
        return [
            'Hari',
            "Jam Ke-1\n07:00 - 07:40",
            "Jam Ke-2\n07:40 - 08:20",
            "Jam Ke-3\n08:20 - 09:00",
            "Jam Ke-4\n09:00 - 09:40",
            "Jam Ke-5\n09:40 - 10:20",
            "Jam Ke-6\n10:40 - 11:20",
            "Jam Ke-7\n11:20 - 12:00",
            "Jam Ke-8\n12:30 - 13:10",
            "Jam Ke-9\n13:10 - 13:50",
            "Jam Ke-10\n13:50 - 14:30"
        ];
    }

    public function collection()
    {
        $schedules = TeachingSchedule::with(['schoolClass'])
            ->where('employee_id', $this->employee_id)
            ->get()
            ->groupBy('day_of_week');

        $days = [
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat'
        ];

        $exportData = [];

        foreach ($days as $dayNum => $dayName) {
            $row = [$dayName];
            $daySchedules = isset($schedules[$dayNum]) ? $schedules[$dayNum]->keyBy('hour_number') : collect();

            for ($hour = 1; $hour <= 10; $hour++) {
                if ($daySchedules->has($hour)) {
                    $schedule = $daySchedules->get($hour);
                    $className = $schedule->schoolClass->name ?? '';
                    $row[] = "{$schedule->subject} / {$className}";
                } else {
                    $row[] = '';
                }
            }
            $exportData[] = $row;
        }

        // Add instructions row
        $exportData[] = ['']; // Empty row separator
        $exportData[] = ['PETUNJUK PENGISIAN:'];
        $exportData[] = ['1. Isi sel dengan format: "Mata Pelajaran / Nama Kelas" (Contoh: "KKA / X TJKT-3")'];
        $exportData[] = ['2. Kosongkan sel jika tidak ada jadwal mengajar pada jam tersebut.'];
        $exportData[] = ['3. Nama Kelas harus sama persis dengan yang ada di sistem (Menu Data Kelas).'];
        $exportData[] = ['4. Jangan ubah struktur kolom atau nama Hari.'];

        return collect($exportData);
    }
    
    public function title(): string
    {
        return 'Jadwal Mengajar';
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                
                // Style headings
                $sheet->getStyle('A1:K1')->applyFromArray([
                    'font' => ['bold' => true],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                        ],
                    ],
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'E2E8F0']
                    ]
                ]);
                $sheet->getRowDimension(1)->setRowHeight(40);
                
                // Style data grid
                $sheet->getStyle('A2:K6')->applyFromArray([
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                        ],
                    ]
                ]);
                
                // Hari column bold
                $sheet->getStyle('A2:A6')->getFont()->setBold(true);
                
                // Set row heights for data
                for ($i = 2; $i <= 6; $i++) {
                    $sheet->getRowDimension($i)->setRowHeight(40);
                }
                
                // Style column widths
                $sheet->getColumnDimension('A')->setWidth(15);
                foreach (range('B', 'K') as $col) {
                    $sheet->getColumnDimension($col)->setWidth(25);
                }
                
                // Style Instructions
                $sheet->getStyle('A8:A12')->getFont()->getColor()->setRGB('475569');
                $sheet->getStyle('A8')->getFont()->setBold(true);
            },
        ];
    }
}
