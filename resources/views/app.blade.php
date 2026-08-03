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

        <!-- Favicon -->
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('images/logo.png') }}?v=2">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('images/logo.png') }}?v=2">
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}?v=2">
        <link rel="shortcut icon" type="image/x-icon" href="{{ asset('favicon.ico') }}?v=2">
        <link rel="apple-touch-icon" href="{{ asset('images/logo.png') }}?v=2">

        <!-- Open Graph Meta Tags -->
        <meta property="og:title" content="SIP-MU Enterprise - SMK Manbaul Ulum Cirebon">
        <meta property="og:description" content="Sistem Tata Kelola Kepegawaian, Presensi Presisi, dan Manajemen Kedisiplinan SMK Manbaul Ulum Cirebon.">
        <meta property="og:image" content="{{ asset('images/logo.png') }}">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:type" content="website">

        <title inertia>{{ config('app.name', 'SIP MU Enterprise') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
