<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Image Compression Settings
    |--------------------------------------------------------------------------
    |
    | Konfigurasi kompresi gambar otomatis untuk menghemat storage.
    | Quality: 1-100 (semakin rendah = semakin kecil, semakin blur)
    | Max Width/Height: Resize proporsional, tidak melebihi nilai ini
    |
    */

    'profile' => [
        'max_width' => 800,
        'max_height' => 800,
        'quality' => 80,
    ],

    'attendance' => [
        'max_width' => 1024,
        'max_height' => 1024,
        'quality' => 75,
    ],

    /*
    |--------------------------------------------------------------------------
    | Output Format
    |--------------------------------------------------------------------------
    | Format output gambar setelah kompresi. JPEG memberikan rasio
    | kompresi terbaik untuk foto. Gunakan 'webp' untuk penghematan lebih.
    |
    */
    'output_format' => 'webp',

    /*
    |--------------------------------------------------------------------------
    | Enable Compression
    |--------------------------------------------------------------------------
    | Toggle master untuk mengaktifkan/menonaktifkan kompresi.
    | Jika false, semua foto akan disimpan tanpa kompresi.
    |
    */
    'enabled' => env('IMAGE_COMPRESSION_ENABLED', true),

];
