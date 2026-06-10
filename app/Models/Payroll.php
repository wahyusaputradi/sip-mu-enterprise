<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'month',
        'year',
        'gross_salary',
        'allowance_other',
        'total_deductions',
        'deduction_other',
        'net_salary',
        'details',
        'status',
        'notes',
    ];

    protected $casts = [
        'details' => 'array',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
