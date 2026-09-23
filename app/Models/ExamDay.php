<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamDay extends Model
{
    protected $fillable = [
        'date',
        'name',
        'type',
        'jam_keluar',
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
