<?php

namespace App\Http\Controllers;

use App\Models\Position;
use App\Exports\PositionsExport;
use App\Exports\PositionTemplateExport;
use App\Imports\PositionsImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class PositionController extends Controller
{
    public function index()
    {
        $positions = Position::withCount('employees')->orderBy('name')->get();
        return Inertia::render('Positions/Index', [
            'positions' => $positions
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255|unique:positions,name',
            'description' => 'nullable|string|max:1000',
        ]);

        Position::create($request->only(['name', 'description']));

        return back()->with('message', 'Jabatan berhasil ditambahkan.');
    }

    public function update(Request $request, Position $position)
    {
        $request->validate([
            'name'        => 'required|string|max:255|unique:positions,name,' . $position->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $position->update($request->only(['name', 'description']));
        return back()->with('message', 'Jabatan berhasil diperbarui.');
    }

    public function destroy(Position $position)
    {
        // Protect relational integrity
        if ($position->employees()->count() > 0) {
            return back()->with('error', 'Jabatan tidak dapat dihapus karena masih digunakan oleh ' . $position->employees()->count() . ' pegawai. Pindahkan pegawai terlebih dahulu.');
        }

        $position->delete();
        return back()->with('message', 'Jabatan berhasil dihapus.');
    }

    /**
     * Bulk delete positions
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer|exists:positions,id']);

        $positions = Position::withCount('employees')->whereIn('id', $request->ids)->get();

        $protected = $positions->filter(fn($p) => $p->employees_count > 0);

        if ($protected->isNotEmpty()) {
            $names = $protected->pluck('name')->join(', ');
            return back()->with('error', "Jabatan berikut tidak dapat dihapus karena masih digunakan oleh pegawai: {$names}.");
        }

        Position::whereIn('id', $request->ids)->delete();

        return back()->with('message', count($request->ids) . ' jabatan berhasil dihapus.');
    }

    /**
     * Export all positions to Excel
     */
    public function export()
    {
        return Excel::download(new PositionsExport, 'data-jabatan-' . date('Y-m-d') . '.xlsx');
    }

    /**
     * Download import template
     */
    public function template()
    {
        return Excel::download(new PositionTemplateExport, 'template-import-jabatan.xlsx');
    }

    /**
     * Import positions from Excel
     */
    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:xlsx,xls,csv|max:10240']);

        Excel::import(new PositionsImport, $request->file('file'));

        return back()->with('message', 'Data jabatan berhasil diimpor.');
    }
}
