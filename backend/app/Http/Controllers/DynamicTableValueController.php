<?php

namespace App\Http\Controllers;

use App\Services\DynamicTableValueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DynamicTableValueController extends Controller
{
    public function update(
        Request $request,
        string $module,
        string $record,
        DynamicTableValueService $values,
    ): JsonResponse {
        $validated = $request->validate([
            'custom_fields' => ['required', 'array'],
        ]);

        return response()->json([
            'data' => $values->sync($module, $record, $validated['custom_fields']),
        ]);
    }
}
