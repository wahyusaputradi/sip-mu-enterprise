<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\EmployeeController;

use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\SubstituteTeachingController;
use App\Http\Controllers\SystemSettingController;

use App\Http\Controllers\PositionController;
use App\Http\Controllers\CampusLocationController;
use App\Http\Controllers\UserAuthorityController;
use App\Http\Controllers\TeachingScheduleController;
use App\Http\Controllers\MyScheduleController;
use App\Http\Controllers\MyAttendanceController;
use App\Http\Controllers\AttendancePhotoController;


use App\Http\Controllers\NotificationController;
use App\Http\Controllers\MediaStreamController;
use App\Http\Controllers\PublicPageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/robots.txt', function () {
    $content = file_exists(public_path('robots.txt')) 
        ? file_get_contents(public_path('robots.txt')) 
        : "User-agent: Mediapartners-Google\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\nAllow: /ads.txt\n\nUser-agent: *\nAllow: /\nSitemap: https://sipmuenterprise.my.id/sitemap.xml";
    return response($content, 200)->header('Content-Type', 'text/plain');
});

Route::get('/manifest.json', function () {
    $manifestPath = public_path('manifest.json');
    if (file_exists($manifestPath)) {
        return response()->file($manifestPath, [
            'Content-Type' => 'application/manifest+json',
            'Access-Control-Allow-Origin' => '*'
        ]);
    }
    return response()->json([
        'id' => '/',
        'name' => 'SIP MU Enterprise',
        'short_name' => 'SIP MU',
        'description' => 'Sistem Informasi Presensi & Kehadiran SMK Manbaul Ulum Cirebon',
        'start_url' => '/',
        'display' => 'standalone'
    ], 200, ['Access-Control-Allow-Origin' => '*']);
});

Route::get('/sw.js', function () {
    $swPath = public_path('sw.js');
    if (file_exists($swPath)) {
        return response()->file($swPath, [
            'Content-Type' => 'application/javascript',
            'Access-Control-Allow-Origin' => '*'
        ]);
    }
    return response('console.log("SW loaded");', 200, ['Content-Type' => 'application/javascript']);
});

Route::get('/sitemap.xml', function () {
    if (file_exists(public_path('sitemap.xml'))) {
        return response(file_get_contents(public_path('sitemap.xml')), 200)->header('Content-Type', 'text/xml');
    }

    $urls = [
        'https://sipmuenterprise.my.id/',
        'https://sipmuenterprise.my.id/about',
        'https://sipmuenterprise.my.id/contact',
        'https://sipmuenterprise.my.id/privacy-policy',
        'https://sipmuenterprise.my.id/terms-of-service',
        'https://sipmuenterprise.my.id/articles',
        'https://sipmuenterprise.my.id/articles/panduan-presensi-geofencing-gps-sekolah-digital',
        'https://sipmuenterprise.my.id/articles/efisiensi-manajemen-jam-mengajar-jtm-guru-kejuruan',
        'https://sipmuenterprise.my.id/articles/integrasi-pwa-dan-aplikasi-mobile-presensi-sekolah',
    ];

    $xml = '<?xml version="1.0" encoding="UTF-8"?>';
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    foreach ($urls as $url) {
        $xml .= '<url><loc>' . $url . '</loc><lastmod>' . date('Y-m-d') . '</lastmod><priority>0.8</priority></url>';
    }
    $xml .= '</urlset>';

    return response($xml, 200)->header('Content-Type', 'text/xml');
});

Route::get('/ads.txt', function () {
    $content = file_exists(public_path('ads.txt'))
        ? file_get_contents(public_path('ads.txt'))
        : "google.com, pub-1006393524825968, DIRECT, f08c47fec0942fa0";
    return response($content, 200)->header('Content-Type', 'text/plain');
});

Route::get('/download-apk', function () {
    $apkPath = public_path('downloads/SIP-MU-Enterprise.apk');
    if (file_exists($apkPath) && filesize($apkPath) > 100000) {
        return response()->download($apkPath, 'SIP-MU-Enterprise.apk', [
            'Content-Type' => 'application/vnd.android.package-archive',
            'Content-Disposition' => 'attachment; filename="SIP-MU-Enterprise.apk"'
        ]);
    }
    return response("<html lang='id'><head><title>Install Aplikasi Android - SIP MU Enterprise</title><meta name='viewport' content='width=device-width, initial-scale=1.0'><script src='https://cdn.tailwindcss.com'></script></head><body class='bg-slate-950 text-white min-h-screen flex items-center justify-center p-6 font-sans'><div class='max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl'><div class='w-16 h-16 bg-indigo-600/30 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30'><svg class='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'></path></svg></div><h2 class='text-xl font-black mb-2'>Install Aplikasi Android (WebAPK)</h2><p class='text-xs text-slate-400 mb-6 leading-relaxed'>Pesan <i>'Ada masalah saat mengurai paket'</i> terjadi jika file APK mentah belum dikompilasi secara biner.<br><br>Gunakan metode <b>WebAPK Instan</b> di bawah ini untuk memasang aplikasi resmi secara langsung di smartphone Android tanpa download file besar dan 100% bebas error!</p><div class='space-y-3'><a href='/?install=true' class='block w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 hover:opacity-90 transition-opacity'>📱 Install Aplikasi Langsung di HP Android</a><a href='https://www.pwabuilder.com/image?url=https://sipmuenterprise.my.id/manifest.json' target='_blank' class='block w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold text-xs border border-slate-700 text-slate-300 transition-colors'>⚙️ Download File APK Resmi (PWABuilder)</a></div></div></body></html>");
});

// Halaman Publik Wajib AdSense Compliance
Route::get('/privacy-policy', [PublicPageController::class, 'privacyPolicy'])->name('privacy-policy');
Route::get('/terms-of-service', [PublicPageController::class, 'termsOfService'])->name('terms-of-service');
Route::get('/about', [PublicPageController::class, 'aboutUs'])->name('about');
Route::get('/contact', [PublicPageController::class, 'contactUs'])->name('contact');
Route::get('/articles', [PublicPageController::class, 'blogIndex'])->name('articles.index');
Route::get('/articles/{slug}', [PublicPageController::class, 'blogDetail'])->name('articles.show');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {

    // Media stream route (available for all authenticated users, internally authorized)
    Route::get('/media/stream', [MediaStreamController::class, 'stream'])->name('media.stream');

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

        // Kelola Foto Presensi - Read Only & Download
        Route::get('/monitoring/photos', [AttendancePhotoController::class, 'index'])->name('monitoring.photos.index');
        Route::post('/monitoring/photos/prepare-download', [AttendancePhotoController::class, 'prepareDownload'])->name('monitoring.photos.prepare-download');
        Route::match(['get', 'post'], '/monitoring/photos/download', [AttendancePhotoController::class, 'downloadZip'])->name('monitoring.photos.download');
    });

    // Kelola Foto Presensi - Delete Operations (Excludes Kepala Sekolah)
    Route::middleware(['role:Super Admin|Kurikulum|Absensi'])->group(function () {
        Route::delete('/monitoring/photos/{type}/{id}', [AttendancePhotoController::class, 'destroy'])->name('monitoring.photos.destroy');
        Route::post('/monitoring/photos/bulk-destroy', [AttendancePhotoController::class, 'bulkDestroy'])->name('monitoring.photos.bulk-destroy');
    });

    Route::middleware(['role:Super Admin|Kepala Sekolah|Kurikulum|Absensi'])->group(function () {
        Route::get('/attendance/recap', [AttendanceController::class, 'recap'])->name('attendance.recap');
        Route::get('/attendance/recap/export-excel', [AttendanceController::class, 'exportExcel'])->name('attendance.recap.export-excel');
        Route::get('/attendance/recap/export-pdf', [AttendanceController::class, 'exportPdf'])->name('attendance.recap.export-pdf');
    });

    // ══════════════════════════════════════════════════
    // AREA MANAJEMEN — Data Pegawai & Jabatan
    // ══════════════════════════════════════════════════
    // Read-Only Access & Exports (Includes Kepala Sekolah)
    Route::middleware(['role:Super Admin|Kepala Sekolah|Bendahara'])->group(function () {
        Route::get('employees', [EmployeeController::class, 'index'])->name('employees.index');
        Route::get('employees/export', [EmployeeController::class, 'export'])->name('employees.export');

        Route::get('positions', [PositionController::class, 'index'])->name('positions.index');
        Route::get('positions/export', [PositionController::class, 'export'])->name('positions.export');
    });

    // Write Operations & Fixed Sub-routes (Excludes Kepala Sekolah)
    Route::middleware(['role:Super Admin|Bendahara'])->group(function () {
        Route::get('employees/template', [EmployeeController::class, 'template'])->name('employees.template');
        Route::post('employees/import', [EmployeeController::class, 'import'])->name('employees.import');
        Route::post('employees/bulk-destroy', [EmployeeController::class, 'bulkDestroy'])->name('employees.bulk-destroy');
        Route::get('employees/create', [EmployeeController::class, 'create'])->name('employees.create');
        Route::post('employees', [EmployeeController::class, 'store'])->name('employees.store');
        Route::get('employees/{employee}/edit', [EmployeeController::class, 'edit'])->name('employees.edit');
        Route::put('employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
        Route::patch('employees/{employee}', [EmployeeController::class, 'update']);
        Route::delete('employees/{employee}', [EmployeeController::class, 'destroy'])->name('employees.destroy');

        Route::get('positions/template', [PositionController::class, 'template'])->name('positions.template');
        Route::post('positions/import', [PositionController::class, 'import'])->name('positions.import');
        Route::post('positions/bulk-destroy', [PositionController::class, 'bulkDestroy'])->name('positions.bulk-destroy');
        Route::get('positions/create', [PositionController::class, 'create'])->name('positions.create');
        Route::post('positions', [PositionController::class, 'store'])->name('positions.store');
        Route::get('positions/{position}/edit', [PositionController::class, 'edit'])->name('positions.edit');
        Route::put('positions/{position}', [PositionController::class, 'update'])->name('positions.update');
        Route::patch('positions/{position}', [PositionController::class, 'update']);
        Route::delete('positions/{position}', [PositionController::class, 'destroy'])->name('positions.destroy');
    });

    // Dynamic Parameterized Detail Routes (Placed last to prevent route collision)
    Route::middleware(['role:Super Admin|Kepala Sekolah|Bendahara'])->group(function () {
        Route::get('employees/{employee}', [EmployeeController::class, 'show'])->name('employees.show');
        Route::get('positions/{position}', [PositionController::class, 'show'])->name('positions.show');
    });

    // ══════════════════════════════════════════════════
    // AREA MANAJEMEN — Jadwal Mengajar & Data Kelas
    // ══════════════════════════════════════════════════
    Route::middleware(['role:Super Admin|Kepala Sekolah|Kurikulum|Absensi'])->group(function () {
        Route::get('/teaching-schedules', [TeachingScheduleController::class, 'index'])->name('teaching-schedules.index');
        Route::get('/teaching-schedules/export/excel', [TeachingScheduleController::class, 'export'])->name('teaching-schedules.export');
    });

    // Write Operations Jadwal (Excludes Kepala Sekolah)
    Route::middleware(['role:Super Admin|Kurikulum'])->group(function () {
        Route::post('/teaching-schedules', [TeachingScheduleController::class, 'store'])->name('teaching-schedules.store');
        Route::put('/teaching-schedules/{teachingSchedule}', [TeachingScheduleController::class, 'update'])->name('teaching-schedules.update');
        Route::delete('/teaching-schedules/{teachingSchedule}', [TeachingScheduleController::class, 'destroy'])->name('teaching-schedules.destroy');
        Route::post('/teaching-schedules/import/excel', [TeachingScheduleController::class, 'import'])->name('teaching-schedules.import');
    });

    Route::middleware(['role:Super Admin|Kepala Sekolah|Kurikulum'])->group(function () {
        // Persetujuan Cuti/Izin
        Route::get('/leave-requests/approval', [LeaveRequestController::class, 'approval'])->name('leave-requests.approval');
        Route::post('/leave-requests/{leaveRequest}/approve', [LeaveRequestController::class, 'approve'])->name('leave-requests.approve');
        Route::post('/leave-requests/{leaveRequest}/reject', [LeaveRequestController::class, 'reject'])->name('leave-requests.reject');
        Route::delete('/leave-requests/admin/{leaveRequest}', [LeaveRequestController::class, 'destroyByAdmin'])->name('leave-requests.destroy-admin');
    });

    Route::middleware(['role:Super Admin|Kurikulum'])->group(function () {
        Route::get('/school-classes/template', [TeachingScheduleController::class, 'classTemplate'])->name('school-classes.template');
        Route::get('/school-classes/export', [TeachingScheduleController::class, 'classExport'])->name('school-classes.export');
        Route::post('/school-classes/import', [TeachingScheduleController::class, 'classImport'])->name('school-classes.import');
        Route::post('/school-classes/bulk-destroy', [TeachingScheduleController::class, 'classBulkDestroy'])->name('school-classes.bulk-destroy');
        Route::get('/school-classes', [TeachingScheduleController::class, 'classIndex'])->name('school-classes.index');
        Route::post('/school-classes', [TeachingScheduleController::class, 'classStore'])->name('school-classes.store');
        Route::put('/school-classes/{schoolClass}', [TeachingScheduleController::class, 'classUpdate'])->name('school-classes.update');
        Route::delete('/school-classes/{schoolClass}', [TeachingScheduleController::class, 'classDestroy'])->name('school-classes.destroy');
    });



    // ══════════════════════════════════════════════════
    // KONFIGURASI — Super Admin Only
    // ══════════════════════════════════════════════════
    Route::middleware(['role:Super Admin'])->group(function () {
        Route::resource('campus-locations', CampusLocationController::class);
        Route::get('/settings', [SystemSettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SystemSettingController::class, 'update'])->name('settings.update');
        Route::post('/holidays', [\App\Http\Controllers\HolidayController::class, 'store'])->name('holidays.store');
        Route::post('/holidays/bulk-destroy', [\App\Http\Controllers\HolidayController::class, 'bulkDestroy'])->name('holidays.bulk-destroy');
        Route::put('/holidays/{holiday}', [\App\Http\Controllers\HolidayController::class, 'update'])->name('holidays.update');
        Route::delete('/holidays/{holiday}', [\App\Http\Controllers\HolidayController::class, 'destroy'])->name('holidays.destroy');

        // Special Workdays (Hari Kerja Khusus / Acara Sekolah)
        Route::post('/special-workdays', [SystemSettingController::class, 'storeSpecialWorkday'])->name('special-workdays.store');
        Route::delete('/special-workdays/{specialWorkday}', [SystemSettingController::class, 'destroySpecialWorkday'])->name('special-workdays.destroy');

        // User Authority
        Route::get('/user-authority', [UserAuthorityController::class, 'index'])->name('user-authority.index');
        Route::put('/user-authority/{user}', [UserAuthorityController::class, 'update'])->name('user-authority.update');
        Route::post('/user-authority/bulk-reset-password', [UserAuthorityController::class, 'bulkResetPassword'])->name('user-authority.bulk-reset-password');


    });
});

require __DIR__.'/auth.php';
