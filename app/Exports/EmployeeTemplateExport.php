<?php

namespace App\Exports;

use App\Models\Position;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Protection;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;

class EmployeeTemplateExport implements WithEvents
{
    private function getHeaders(): array
    {
        return [
            'NIK',                                        // Col A (0)
            'NIK Kependudukan',                           // Col B (1)
            'NUPTK',                                      // Col C (2)
            'Nama Lengkap',                               // Col D (3)
            'Jenis Kelamin (Laki-laki/Perempuan)',         // Col E (4)
            'Tempat Lahir',                               // Col F (5)
            'Tanggal Lahir (YYYY-MM-DD)',                  // Col G (6)
            'Email Login',                                // Col H (7)
            'No WhatsApp',                                // Col I (8)
            'Jabatan',                                    // Col J (9)
            'Tanggal Mulai Kerja (YYYY-MM-DD)',           // Col K (10)
            'Ijazah Terakhir',                            // Col L (11)
            'Bidang Studi',                               // Col M (12)
            'Jam KBM',                                    // Col N (13)
            'Wali Kelas (Y/T)',                           // Col O (14)
            'Kelas Wali',                                 // Col P (15)
            'Pembina Eskul (Y/T)',                        // Col Q (16)
            'Nama Eskul',                                 // Col R (17)
            'Status (Aktif/Non-Aktif)',                    // Col S (18)
        ];
    }

    private function getSampleData(): array
    {
        return [
            '1980010123456789',          // NIK
            '3573012345678901',          // NIK Kependudukan
            '1234567890123456',          // NUPTK
            'Budi Santoso, S.Pd',        // Nama Lengkap
            'Laki-laki',                 // Jenis Kelamin
            'Jakarta',                   // Tempat Lahir
            '1980-01-01',                // Tanggal Lahir
            'budi.santoso@smkmu.sch.id', // Email Login (opsional)
            '081234567890',              // No WhatsApp
            'Guru Produktif',            // Jabatan
            '2015-07-15',                // Tanggal Mulai Kerja
            'S1 Pendidikan Informatika', // Ijazah Terakhir
            'Pemrograman Web',           // Bidang Studi
            '24',                        // Jam KBM
            'Y',                         // Wali Kelas
            'X RPL 1',                   // Kelas Wali
            'T',                         // Pembina Eskul
            '',                          // Nama Eskul
            'Aktif',                     // Status
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastCol = 'S';
                $headers = $this->getHeaders();
                $sample = $this->getSampleData();

                // ─── Row 1: Title ───
                $sheet->setCellValue('A1', 'TEMPLATE IMPORT DATA PEGAWAI');
                $sheet->mergeCells("A1:{$lastCol}1");
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16)->getColor()->setRGB('1E293B');
                $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                $sheet->getRowDimension(1)->setRowHeight(30);

                // ─── Row 2: Warning ───
                $sheet->setCellValue('A2', '⚠ PENTING: Jangan mengubah atau menghapus baris ke-4 (Header). Kolom NIK bersifat wajib dan unik.');
                $sheet->mergeCells("A2:{$lastCol}2");
                $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(10)->getColor()->setRGB('DC2626');
                $sheet->getStyle('A2')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FEF2F2');

                // ─── Row 3: Instructions ───
                $sheet->setCellValue('A3', 'Isi data mulai baris ke-5 (ke bawah). Baris ke-5 berisi contoh — hapus atau timpa dengan data asli. Email Login boleh kosong (akan di-generate otomatis).');
                $sheet->mergeCells("A3:{$lastCol}3");
                $sheet->getStyle('A3')->getFont()->setItalic(true)->setSize(10)->getColor()->setRGB('64748B');
                $sheet->getStyle('A3')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FFFBEB');

                // ─── Row 4: Headers ───
                $colLetters = range('A', 'S');
                foreach ($headers as $i => $header) {
                    $cell = $colLetters[$i] . '4';
                    $sheet->setCellValue($cell, $header);
                }
                $sheet->getStyle("A4:{$lastCol}4")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => '4F46E5']],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => '6366F1'],
                        ],
                    ],
                ]);
                $sheet->getRowDimension(4)->setRowHeight(36);

                // ─── Row 5: Sample Data ───
                foreach ($sample as $i => $value) {
                    $cell = $colLetters[$i] . '5';
                    $sheet->setCellValue($cell, $value);
                }
                $sheet->getStyle("A5:{$lastCol}5")->applyFromArray([
                    'font' => ['italic' => true, 'color' => ['rgb' => '94A3B8']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => 'F1F5F9']],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => 'E2E8F0'],
                        ],
                    ],
                ]);

                // ─── Column Widths ───
                $widths = [
                    'A' => 22, 'B' => 22, 'C' => 22, 'D' => 30, 'E' => 18,
                    'F' => 16, 'G' => 20, 'H' => 30, 'I' => 18, 'J' => 22,
                    'K' => 22, 'L' => 26, 'M' => 20, 'N' => 10, 'O' => 16,
                    'P' => 14, 'Q' => 18, 'R' => 18, 'S' => 20,
                ];
                foreach ($widths as $col => $w) {
                    $sheet->getColumnDimension($col)->setWidth($w);
                }

                // ─── Data Validation: Dropdown for Jenis Kelamin (E6:E1000) ───
                $genderValidation = $sheet->getCell('E6')->getDataValidation();
                $genderValidation->setType(DataValidation::TYPE_LIST);
                $genderValidation->setAllowBlank(false);
                $genderValidation->setShowDropDown(true);
                $genderValidation->setFormula1('"Laki-laki,Perempuan"');
                $genderValidation->setErrorTitle('Input Tidak Valid');
                $genderValidation->setError('Pilih: Laki-laki atau Perempuan');
                $sheet->setDataValidation('E6:E1000', $genderValidation);

                // ─── Data Validation: Dropdown for Wali Kelas (O6:O1000) ───
                $ynValidation = $sheet->getCell('O6')->getDataValidation();
                $ynValidation->setType(DataValidation::TYPE_LIST);
                $ynValidation->setAllowBlank(false);
                $ynValidation->setShowDropDown(true);
                $ynValidation->setFormula1('"Y,T"');
                $sheet->setDataValidation('O6:O1000', $ynValidation);

                // ─── Data Validation: Dropdown for Pembina Eskul (Q6:Q1000) ───
                $sheet->setDataValidation('Q6:Q1000', clone $ynValidation);

                // ─── Data Validation: Dropdown for Status (S6:S1000) ───
                $statusValidation = $sheet->getCell('S6')->getDataValidation();
                $statusValidation->setType(DataValidation::TYPE_LIST);
                $statusValidation->setAllowBlank(false);
                $statusValidation->setShowDropDown(true);
                $statusValidation->setFormula1('"Aktif,Non-Aktif"');
                $sheet->setDataValidation('S6:S1000', $statusValidation);

                // ─── Data Validation: Dropdown for Jabatan (J6:J1000) ───
                $positions = Position::orderBy('name')->pluck('name')->toArray();
                if (!empty($positions)) {
                    $positionList = implode(',', array_slice($positions, 0, 50));
                    $posValidation = $sheet->getCell('J6')->getDataValidation();
                    $posValidation->setType(DataValidation::TYPE_LIST);
                    $posValidation->setAllowBlank(true);
                    $posValidation->setShowDropDown(true);
                    $posValidation->setFormula1('"' . $positionList . '"');
                    $sheet->setDataValidation('J6:J1000', $posValidation);
                }

                // ─── Freeze pane at data area ───
                $sheet->freezePane('A5');

                // ─── Sheet Protection (protect header, allow data editing) ───
                $sheet->getProtection()->setSheet(true);
                $sheet->getProtection()->setPassword('sipmu');
                // Unlock data rows (5+) for editing
                $sheet->getStyle("A5:{$lastCol}1000")->getProtection()
                    ->setLocked(Protection::PROTECTION_UNPROTECTED);
                // Lock header area
                $sheet->getStyle("A1:{$lastCol}4")->getProtection()
                    ->setLocked(Protection::PROTECTION_PROTECTED);
            },
        ];
    }
}
