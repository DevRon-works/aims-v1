<?php

namespace App\Http\Controllers;

use App\Services\ImportHistoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImportStatusController extends Controller
{
    public function index(ImportHistoryService $imports): JsonResponse
    {
        return response()->json(['data' => $imports->status()]);
    }

    public function show(string $module, ImportHistoryService $imports): JsonResponse
    {
        return response()->json(['data' => $imports->status($module)]);
    }

    public function reset(Request $request, ImportHistoryService $imports): JsonResponse
    {
        $validated = $request->validate([
            'module_name' => ['required', 'string', 'max:255'],
            'import_type' => ['nullable', 'string', 'max:255'],
        ]);

        $imports->reset($request, $validated['module_name'], $validated['import_type'] ?? 'default');

        return response()->json(['message' => 'Import lock reset.']);
    }
}
