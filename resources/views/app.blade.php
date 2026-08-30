<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="SIP-MU Enterprise - Sistem Tata Kelola Kepegawaian, Presensi Presisi, dan Manajemen Kedisiplinan SMK Manbaul Ulum Cirebon.">
        <meta name="keywords" content="SIP-MU Enterprise, SMK Manbaul Ulum Cirebon, Presensi Guru, Presensi Pegawai, E-Absensi">
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="{{ url()->current() }}">

        <!-- Anti-FOIT Dark Mode Init Script -->
        <script>
            (function() {
                try {
                    var t = localStorage.getItem('theme');
                    var sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (t === 'dark' || (t === 'system' && sysDark) || (!t && sysDark)) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                } catch (e) {}
            })();
        </script>

        <!-- Favicon & PWA Manifest -->
        <link rel="manifest" href="{{ asset('manifest.json') }}">
        <meta name="theme-color" content="#0B0F19">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="SIP MU Enterprise">
        <link rel="apple-touch-icon" href="{{ asset('images/logo.png') }}?v=2">
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('images/logo.png') }}?v=2">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('images/logo.png') }}?v=2">
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}?v=2">
        <link rel="shortcut icon" type="image/x-icon" href="{{ asset('favicon.ico') }}?v=2">

        <!-- Service Worker Registration -->
        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                    navigator.serviceWorker.register("{{ asset('sw.js') }}").then(function(reg) {
                        console.log('SIP MU ServiceWorker registered successfully:', reg.scope);
                    }).catch(function(err) {
                        console.log('SIP MU ServiceWorker registration failed:', err);
                    });
                });
            }
        </script>

        <!-- Open Graph Meta Tags -->
        <meta property="og:title" content="SIP-MU Enterprise - SMK Manbaul Ulum Cirebon">
        <meta property="og:description" content="Sistem Tata Kelola Kepegawaian, Presensi Presisi, dan Manajemen Kedisiplinan SMK Manbaul Ulum Cirebon.">
        <meta property="og:image" content="{{ asset('images/logo.png') }}">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:type" content="website">

        <title inertia>{{ config('app.name', 'SIP MU Enterprise') }}</title>

        <!-- Google AdSense Direct Script -->
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1006393524825968" crossorigin="anonymous"></script>

        <!-- Fonts & Preconnect Optimization -->
        <link rel="dns-prefetch" href="https://fonts.bunny.net">
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        @inertia
    </body>
</html>
