<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HolidayController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'mode' => 'required|in:single,range',
            'description' => 'required|string|max:255',
            'is_national_holiday' => 'required|boolean',
            'date' => 'required_if:mode,single|nullable|date',
            'start_date' => 'required_if:mode,range|nullable|date',
            'end_date' => 'required_if:mode,range|nullable|date|after_or_equal:start_date',
        ]);

        $isNational = (bool) $request->is_national_holiday;
        $desc = $request->description;

        if ($request->mode === 'single') {
            $date = \Carbon\Carbon::parse($request->date);
            \App\Models\Holiday::updateOrCreate(
                ['date' => $date],
                [
                    'description' => $desc,
                    'is_national_holiday' => $isNational
                ]
            );
        } else {
            $start = \Carbon\Carbon::parse($request->start_date);
            $end = \Carbon\Carbon::parse($request->end_date);

            $current = $start->copy();
            while ($current->lte($end)) {
                \App\Models\Holiday::updateOrCreate(
                    ['date' => $current->copy()],
                    [
                        'description' => $desc,
                        'is_national_holiday' => $isNational
                    ]
                );
                $current->addDay();
            }
        }

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

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:holidays,id',
        ]);

        \App\Models\Holiday::whereIn('id', $request->ids)->delete();

        return back()->with('message', 'Hari libur terpilih berhasil dihapus.');
    }
}
