<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpecialWorkday extends Model
{
    protected $fillable = [
        'date',
        'name',
        'jam_keluar',
        'disable_kbm',
    ];

    protected $casts = [
        'date' => 'date',
        'disable_kbm' => 'boolean',
    ];
}
