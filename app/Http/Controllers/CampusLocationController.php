<?php

namespace App\Http\Controllers;

use App\Models\CampusLocation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CampusLocationController extends Controller
{
    public function index()
    {
        $locations = CampusLocation::orderBy('name')->get();
        return Inertia::render('Settings/Locations', [
            'locations' => $locations
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'required|numeric|min:10|max:10000',
        ], [
            'name.required' => 'Nama lokasi wajib diisi.',
            'latitude.required' => 'Latitude wajib diisi.',
            'latitude.numeric' => 'Latitude harus berupa angka.',
            'latitude.between' => 'Latitude harus antara -90 dan 90.',
            'longitude.required' => 'Longitude wajib diisi.',
            'longitude.numeric' => 'Longitude harus berupa angka.',
            'longitude.between' => 'Longitude harus antara -180 dan 180.',
            'radius.required' => 'Radius wajib diisi.',
            'radius.min' => 'Radius minimal 10 meter.',
            'radius.max' => 'Radius maksimal 10.000 meter.',
        ]);

        CampusLocation::create($validated);

        return back()->with('message', 'Lokasi kampus berhasil ditambahkan.');
    }

    public function update(Request $request, CampusLocation $campusLocation)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'required|numeric|min:10|max:10000',
        ], [
            'name.required' => 'Nama lokasi wajib diisi.',
            'latitude.required' => 'Latitude wajib diisi.',
            'latitude.numeric' => 'Latitude harus berupa angka.',
            'latitude.between' => 'Latitude harus antara -90 dan 90.',
            'longitude.required' => 'Longitude wajib diisi.',
            'longitude.numeric' => 'Longitude harus berupa angka.',
            'longitude.between' => 'Longitude harus antara -180 dan 180.',
            'radius.required' => 'Radius wajib diisi.',
            'radius.min' => 'Radius minimal 10 meter.',
            'radius.max' => 'Radius maksimal 10.000 meter.',
        ]);

        $campusLocation->update($validated);
        return back()->with('message', 'Lokasi kampus berhasil diperbarui.');
    }

    public function destroy(CampusLocation $campusLocation)
    {
        $campusLocation->delete();
        return back()->with('message', 'Lokasi kampus berhasil dihapus.');
    }
}
