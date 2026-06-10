<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HolidayController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date|unique:holidays,date',
            'description' => 'required|string|max:255',
            'is_national_holiday' => 'required|boolean',
        ]);

        \App\Models\Holiday::create($request->all());

        return back()->with('message', 'Hari libur berhasil ditambahkan.');
    }

    public function update(Request $request, \App\Models\Holiday $holiday)
    {
        $request->validate([
            'date' => 'required|date|unique:holidays,date,' . $holiday->id,
            'description' => 'required|string|max:255',
            'is_national_holiday' => 'required|boolean',
        ]);

        $holiday->update($request->all());

        return back()->with('message', 'Hari libur berhasil diperbarui.');
    }

    public function destroy(\App\Models\Holiday $holiday)
    {
        $holiday->delete();

        return back()->with('message', 'Hari libur berhasil dihapus.');
    }
}
