<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\SubstituteTeachingController;
use App\Http\Controllers\SystemSettingController;
use App\Http\Controllers\SalarySettingController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\CampusLocationController;
use App\Http\Controllers\UserAuthorityController;
use App\Http\Controllers\TeachingScheduleController;
use App\Http\Controllers\MyScheduleController;
use App\Http\Controllers\MyAttendanceController;
use App\Http\Controllers\MyPayslipController;
use App\Http\Controllers\NotificationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {

    // ══════════════════════════════════════════════════
    // AREA PRIBADI — Semua role yang login
    // ══════════════════════════════════════════════════
    Route::get('/dashboard', [AttendanceController::class, 'dashboard'])->name('dashboard');

    // Presensi masuk/keluar (semua pegawai)
    Route::get('/presensi', [\App\Http\Controllers\PresensiController::class, 'index'])->name('attendance.presensi');
    Route::post('/presensi/guru', [\App\Http\Controllers\PresensiController::class, 'storeGuru'])->name('attendance.guru');
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn'])->name('attendance.check-in');
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut'])->name('attendance.check-out');

    // Profil
    Route::get('/profile', [\App\Http\Controllers\StaffProfileController::class, 'edit'])->name('profile.edit');
    Route::match(['post', 'put'], '/profile', [\App\Http\Controllers\StaffProfileController::class, 'update'])->name('profile.update');

    // Pengaturan Akun (Kredensial)
    Route::get('/account-settings', [\App\Http\Controllers\AccountSettingsController::class, 'edit'])->name('account.edit');
    Route::post('/account-settings', [\App\Http\Controllers\AccountSettingsController::class, 'update'])->name('account.update');

    // Jadwal Saya (Guru only)
    Route::get('/my-schedule', [MyScheduleController::class, 'index'])->name('my-schedule.index');

    // Rekap Absensi Pribadi
    Route::get('/my-attendance', [MyAttendanceController::class, 'index'])->name('my-attendance.index');

    // Slip Gaji Pribadi
    Route::get('/my-payslip', [MyPayslipController::class, 'index'])->name('my-payslip.index');
    Route::get('/my-payslip/{payroll}', [MyPayslipController::class, 'show'])->name('my-payslip.show');
    Route::get('/my-payslip/{payroll}/download', [MyPayslipController::class, 'downloadSlip'])->name('my-payslip.download');

    // Notifications (Polling)
    Route::get('/notifications/unread', [NotificationController::class, 'getUnread'])->name('notifications.unread');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-as-read');

    // Pengajuan Cuti/Izin (semua pegawai)
    Route::get('/leave-requests', [LeaveRequestController::class, 'index'])->name('leave-requests.index');
    Route::post('/leave-requests', [LeaveRequestController::class, 'store'])->name('leave-requests.store');
    Route::put('/leave-requests/{leaveRequest}', [LeaveRequestController::class, 'update'])->name('leave-requests.update');
    Route::delete('/leave-requests/{leaveRequest}', [LeaveRequestController::class, 'destroy'])->name('leave-requests.destroy');

    // Pengajuan/Manajemen Inval (Jam Ganti)
    Route::get('/invals', [SubstituteTeachingController::class, 'index'])->name('invals.index');
    Route::post('/invals', [SubstituteTeachingController::class, 'store'])->name('invals.store');
    Route::post('/invals/{inval}/approve', [SubstituteTeachingController::class, 'approve'])->name('invals.approve');
    Route::post('/invals/{inval}/reject', [SubstituteTeachingController::class, 'reject'])->name('invals.reject');
    Route::delete('/invals/{inval}', [SubstituteTeachingController::class, 'destroy'])->name('invals.destroy');

    // ══════════════════════════════════════════════════
    // AREA MANAJEMEN — Monitoring & Presensi
    // ══════════════════════════════════════════════════
    Route::middleware(['role:Super Admin|Kepala Sekolah|Kurikulum|Absensi'])->group(function () {
        Route::get('/monitoring/attendance', [AttendanceController::class, 'monitoring'])->name('monitoring.attendance');
        Route::get('/monitoring/export-excel', [AttendanceController::class, 'exportMonitoringExcel'])->name('monitoring.export-excel');
        Route::get('/monitoring/export-pdf', [AttendanceController::class, 'exportMonitoringPdf'])->name('monitoring.export-pdf');
        Route::put('/attendance/{attendance}', [AttendanceController::class, 'update'])->name('attendance.update');
        Route::post('/attendance/unlock', [AttendanceController::class, 'unlockAttendance'])->name('attendance.unlock');
    });

    Route::middleware(['role:Super Admin|Kepala Sekolah|Kurikulum|Absensi'])->group(function () {
        Route::get('/attendance/recap', [AttendanceController::class, 'recap'])->name('attendance.recap');
        Route::get('/attendance/recap/export-excel', [AttendanceController::class, 'exportExcel'])->name('attendance.recap.export-excel');
        Route::get('/attendance/recap/export-pdf', [AttendanceController::class, 'exportPdf'])->name('attendance.recap.export-pdf');
    });

    // ══════════════════════════════════════════════════
    // AREA MANAJEMEN — Data Pegawai & Jabatan
    // ══════════════════════════════════════════════════
    Route::middleware(['role:Super Admin|Kepala Sekolah|Bendahara'])->group(function () {
        Route::get('employees/template', [EmployeeController::class, 'template'])->name('employees.template');
        Route::get('employees/export', [EmployeeController::class, 'export'])->name('employees.export');
        Route::post('employees/import', [EmployeeController::class, 'import'])->name('employees.import');
        Route::post('employees/bulk-destroy', [EmployeeController::class, 'bulkDestroy'])->name('employees.bulk-destroy');
        Route::resource('employees', EmployeeController::class);
        Route::get('positions/template', [PositionController::class, 'template'])->name('positions.template');
        Route::get('positions/export', [PositionController::class, 'export'])->name('positions.export');
        Route::post('positions/import', [PositionController::class, 'import'])->name('positions.import');
        Route::post('positions/bulk-destroy', [PositionController::class, 'bulkDestroy'])->name('positions.bulk-destroy');
        Route::resource('positions', PositionController::class);
    });

    // ══════════════════════════════════════════════════
    // AREA MANAJEMEN — Jadwal Mengajar & Data Kelas
    // ══════════════════════════════════════════════════
    Route::middleware(['role:Super Admin|Kepala Sekolah|Kurikulum'])->group(function () {
        Route::get('/teaching-schedules', [TeachingScheduleController::class, 'index'])->name('teaching-schedules.index');
        Route::post('/teaching-schedules', [TeachingScheduleController::class, 'store'])->name('teaching-schedules.store');
        Route::put('/teaching-schedules/{teachingSchedule}', [TeachingScheduleController::class, 'update'])->name('teaching-schedules.update');
        Route::delete('/teaching-schedules/{teachingSchedule}', [TeachingScheduleController::class, 'destroy'])->name('teaching-schedules.destroy');
        Route::get('/teaching-schedules/export/excel', [TeachingScheduleController::class, 'export'])->name('teaching-schedules.export');
        Route::post('/teaching-schedules/import/excel', [TeachingScheduleController::class, 'import'])->name('teaching-schedules.import');

        // Persetujuan Cuti/Izin
        Route::get('/leave-requests/approval', [LeaveRequestController::class, 'approval'])->name('leave-requests.approval');
        Route::post('/leave-requests/{leaveRequest}/approve', [LeaveRequestController::class, 'approve'])->name('leave-requests.approve');
        Route::post('/leave-requests/{leaveRequest}/reject', [LeaveRequestController::class, 'reject'])->name('leave-requests.reject');
    });

    Route::middleware(['role:Super Admin|Kurikulum'])->group(function () {
        Route::get('/school-classes/template', [TeachingScheduleController::class, 'classTemplate'])->name('school-classes.template');
        Route::get('/school-classes/export', [TeachingScheduleController::class, 'classExport'])->name('school-classes.export');
        Route::post('/school-classes/import', [TeachingScheduleController::class, 'classImport'])->name('school-classes.import');
        Route::get('/school-classes', [TeachingScheduleController::class, 'classIndex'])->name('school-classes.index');
        Route::post('/school-classes', [TeachingScheduleController::class, 'classStore'])->name('school-classes.store');
        Route::put('/school-classes/{schoolClass}', [TeachingScheduleController::class, 'classUpdate'])->name('school-classes.update');
        Route::delete('/school-classes/{schoolClass}', [TeachingScheduleController::class, 'classDestroy'])->name('school-classes.destroy');
    });

    // ══════════════════════════════════════════════════
    // AREA MANAJEMEN — Penggajian
    // ══════════════════════════════════════════════════
    Route::middleware(['role:Super Admin|Bendahara'])->group(function () {
        Route::get('/payroll', [PayrollController::class, 'index'])->name('payroll.index');
        Route::post('/payroll/generate', [PayrollController::class, 'generate'])->name('payroll.generate');
        Route::post('/payroll/bulk-update-status', [PayrollController::class, 'updateStatus'])->name('payroll.bulk-update-status');
        Route::get('/payroll/{payroll}/edit', [PayrollController::class, 'edit'])->name('payroll.edit');
        Route::put('/payroll/{payroll}', [PayrollController::class, 'update'])->name('payroll.update');
        Route::get('/payroll/{payroll}/slip', [PayrollController::class, 'downloadSlip'])->name('payroll.slip');
        Route::get('/payroll/{payroll}/detail', [PayrollController::class, 'show'])->name('payroll.show');
        Route::post('/payroll/{payroll}/whatsapp', [PayrollController::class, 'sendWhatsApp'])->name('payroll.whatsapp');
        Route::post('/payroll/whatsapp/bulk', [PayrollController::class, 'sendBulkWhatsApp'])->name('payroll.whatsapp.bulk');

        Route::get('salary-settings', [SalarySettingController::class, 'index'])->name('salary-settings.index');
        Route::put('salary-settings/global', [SalarySettingController::class, 'updateGlobal'])->name('salary-settings.update-global');
        Route::put('salary-settings/positions/{position}', [SalarySettingController::class, 'updatePosition'])->name('salary-settings.update-position');
        Route::put('salary-settings/employees/{employee}', [SalarySettingController::class, 'updateEmployee'])->name('salary-settings.update-employee');
        Route::put('salary-settings/period-date', [SalarySettingController::class, 'updatePayrollDates'])->name('salary-settings.update-period-date');
        Route::put('salary-settings/cutoff-date', [SalarySettingController::class, 'updateCutoffDate'])->name('salary-settings.update-cutoff-date');

        // Export, Import, Template Routes for Salary Settings
        Route::get('salary-settings/global/export', [SalarySettingController::class, 'exportGlobal'])->name('salary-settings.export-global');
        Route::post('salary-settings/global/import', [SalarySettingController::class, 'importGlobal'])->name('salary-settings.import-global');
        Route::get('salary-settings/global/template', [SalarySettingController::class, 'templateGlobal'])->name('salary-settings.template-global');

        Route::get('salary-settings/positions/export', [SalarySettingController::class, 'exportPositions'])->name('salary-settings.export-positions');
        Route::post('salary-settings/positions/import', [SalarySettingController::class, 'importPositions'])->name('salary-settings.import-positions');
        Route::get('salary-settings/positions/template', [SalarySettingController::class, 'templatePositions'])->name('salary-settings.template-positions');

        Route::get('salary-settings/employees/export', [SalarySettingController::class, 'exportEmployees'])->name('salary-settings.export-employees');
        Route::post('salary-settings/employees/import', [SalarySettingController::class, 'importEmployees'])->name('salary-settings.import-employees');
        Route::get('salary-settings/employees/template', [SalarySettingController::class, 'templateEmployees'])->name('salary-settings.template-employees');
    });

    // ══════════════════════════════════════════════════
    // KONFIGURASI — Super Admin Only
    // ══════════════════════════════════════════════════
    Route::middleware(['role:Super Admin'])->group(function () {
        Route::resource('campus-locations', CampusLocationController::class);
        Route::get('/settings', [SystemSettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SystemSettingController::class, 'update'])->name('settings.update');
        Route::post('/holidays', [\App\Http\Controllers\HolidayController::class, 'store'])->name('holidays.store');
        Route::put('/holidays/{holiday}', [\App\Http\Controllers\HolidayController::class, 'update'])->name('holidays.update');
        Route::delete('/holidays/{holiday}', [\App\Http\Controllers\HolidayController::class, 'destroy'])->name('holidays.destroy');

        // User Authority
        Route::get('/user-authority', [UserAuthorityController::class, 'index'])->name('user-authority.index');
        Route::put('/user-authority/{user}', [UserAuthorityController::class, 'update'])->name('user-authority.update');
        Route::post('/user-authority/bulk-reset-password', [UserAuthorityController::class, 'bulkResetPassword'])->name('user-authority.bulk-reset-password');

        // Backup & Restore
        Route::get('/backups', [\App\Http\Controllers\BackupController::class, 'index'])->name('backups.index');
        Route::post('/backups', [\App\Http\Controllers\BackupController::class, 'create'])->name('backups.create');
        Route::get('/backups/download', [\App\Http\Controllers\BackupController::class, 'download'])->name('backups.download');
        Route::delete('/backups', [\App\Http\Controllers\BackupController::class, 'destroy'])->name('backups.destroy');
        Route::post('/backups/restore-db', [\App\Http\Controllers\BackupController::class, 'restoreDatabase'])->name('backups.restore-db');
    });
});

require __DIR__.'/auth.php';
