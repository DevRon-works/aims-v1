<?php

namespace App\Http\Controllers;

use App\Imports\AvadaCenterCctvImport;
use App\Imports\BoutiqueCctvImport;
use App\Imports\WarehouseOnlineCctvImport;
use App\Models\CctvImportHistory;
use App\Services\ImportHistoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CctvImportController extends Controller
{
    public function __invoke(Request $request, ImportHistoryService $imports): JsonResponse
    {
        $validated = $request->validate([
            'cctv_type' => ['required', 'string', 'in:Avada Center,Boutique,Warehouse / Online'],
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv,txt'],
        ]);

        $section = $validated['cctv_type'];
        $imports->assertImportAllowed($request, 'cctv', $section);
        $file = $request->file('file');
        $path = $file->store('tmp/cctv-imports');
        $genericHistory = $imports->start('cctv', $section, $file->getClientOriginalName(), $imports->actorFromRequest($request));

        try {
            $summary = $this->importer($section)->import(Storage::path($path), $request->user()?->name);
            $status = $summary['failed_rows'] > 0 ? 'failed' : 'completed';
            $genericStatus = $status === 'completed' ? 'success' : 'failed';

            CctvImportHistory::query()->create([
                'section' => $section,
                'file_name' => $file->getClientOriginalName(),
                'total_rows' => $summary['total_rows'],
                'imported_rows' => $summary['imported_rows'],
                'skipped_duplicate_rows' => $summary['skipped_duplicate_rows'],
                'updated_rows' => $summary['updated_rows'],
                'failed_rows' => $summary['failed_rows'],
                'validation_errors' => $summary['validation_errors'],
                'status' => $status,
                'imported_by' => $request->user()?->name,
            ]);

            return response()->json([
                ...$summary,
                'cctv_type' => $section,
                'message' => $status === 'completed' ? 'CCTV import completed.' : 'CCTV import failed. No rows were saved.',
            ], $status === 'completed' ? 200 : 422);
        } catch (\InvalidArgumentException $error) {
            $imports->finish($genericHistory, ['total_rows' => 0, 'imported_rows' => 0, 'failed_rows' => 0], 'failed');
            return response()->json([
                'message' => $error->getMessage(),
                'cctv_type' => $section,
                'total_rows' => 0,
                'imported_rows' => 0,
                'skipped_duplicate_rows' => 0,
                'updated_rows' => 0,
                'failed_rows' => 0,
                'validation_errors' => [],
            ], 422);
        } finally {
            if (isset($genericStatus)) {
                $imports->finish($genericHistory, $summary, $genericStatus);
            }
            Storage::delete($path);
        }
    }

    private function importer(string $section): AvadaCenterCctvImport|BoutiqueCctvImport|WarehouseOnlineCctvImport
    {
        return match ($section) {
            'Avada Center' => new AvadaCenterCctvImport(),
            'Boutique' => new BoutiqueCctvImport(),
            'Warehouse / Online' => new WarehouseOnlineCctvImport(),
        };
    }
}
