<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PositionTemplateExport implements FromArray, WithHeadings, WithCustomStartCell, WithEvents, WithStyles
{
    public function array(): array
    {
        return [
            [
                'Guru Produktif',                     // Nama Jabatan
                'Mengampu mata pelajaran produktif',  // Keterangan
                '2000000',                            // Gaji Pokok
                '50000',                              // Tarif per Jam
                '35000',                              // Tarif Inval
                '20000',                              // Potongan Alpha
                '500000',                             // Tunjangan Jabatan
                '250000',                             // Tunjangan Wali Kelas
                '0',                                  // Tunjangan Sertifikasi
                '15000',                              // Tunjangan Makan
                '20000',                              // Tunjangan Transport
            ]
        ];
    }

    public function headings(): array
    {
        return [
            'Nama Jabatan',
            'Keterangan',
            'Gaji Pokok',
            'Tarif per Jam',
            'Tarif Inval',
            'Potongan Alpha',
            'Tunjangan Jabatan',
            'Tunjangan Wali Kelas',
            'Tunjangan Sertifikasi',
            'Tunjangan Makan',
            'Tunjangan Transport',
        ];
    }

    public function startCell(): string
    {
        return 'A4';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            4 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'color' => ['rgb' => '4F46E5']
                ]
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $event->sheet->setCellValue('A1', 'TEMPLATE IMPORT DATA JABATAN');
                $event->sheet->getDelegate()->getStyle('A1')->getFont()->setBold(true)->setSize(14);
                $event->sheet->setCellValue('A2', 'Catatan: Header dimulai di baris 4. Isi data mulai baris 5.');
                $event->sheet->setCellValue('A3', 'Kolom "Nama Jabatan" wajib diisi. Semua nilai tunjangan dalam satuan Rupiah (angka bulat).');
                $event->sheet->getDelegate()->getColumnDimension('A')->setWidth(30);
                $event->sheet->getDelegate()->getColumnDimension('B')->setWidth(40);
                $event->sheet->getDelegate()->getColumnDimension('C')->setWidth(18);
                $event->sheet->getDelegate()->getColumnDimension('D')->setWidth(18);
                $event->sheet->getDelegate()->getColumnDimension('E')->setWidth(18);
                $event->sheet->getDelegate()->getColumnDimension('F')->setWidth(18);
                $event->sheet->getDelegate()->getColumnDimension('G')->setWidth(22);
                $event->sheet->getDelegate()->getColumnDimension('H')->setWidth(22);
                $event->sheet->getDelegate()->getColumnDimension('I')->setWidth(22);
                $event->sheet->getDelegate()->getColumnDimension('J')->setWidth(18);
                $event->sheet->getDelegate()->getColumnDimension('K')->setWidth(22);
            },
        ];
    }
}
