<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'base_salary',
        'hourly_rate',
        'inval_rate',
        'alpha_penalty_rate',
        'allowance_jabatan',
        'allowance_homeroom',
        'allowance_certification',
        'allowance_lunch',
        'allowance_transport',
    ];

    public function employees()
    {
        return $this->belongsToMany(Employee::class, 'employee_position')
                    ->withPivot('is_primary')
                    ->withTimestamps();
    }
}
