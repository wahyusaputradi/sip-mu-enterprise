<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = ['date', 'description', 'is_national_holiday'];
    protected $casts = ['date' => 'date', 'is_national_holiday' => 'boolean'];

    public function getNameAttribute()
    {
        return $this->description;
    }
}
