<?php

namespace App\Http\Controllers;

use App\Models\DynamicTableColumn;
use App\Services\DynamicTableSchemaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DynamicTableColumnController extends Controller
{
    public function index(string $module, DynamicTableSchemaService $schemas): JsonResponse
    {
        return response()->json(['data' => $schemas->columns($module)->values()]);
    }

    public function store(
        Request $request,
        string $module,
        DynamicTableSchemaService $schemas,
    ): JsonResponse {
        $this->authorizeSuperAdmin($request);

        $column = $schemas->createCustomColumn($module, $this->validatedColumn($request));

        return response()->json(['data' => $column], 201);
    }

    public function update(Request $request, string $module, DynamicTableColumn $column): JsonResponse
    {
        $this->authorizeSuperAdmin($request);
        abort_unless($column->module === $module, 404);

        $validated = $this->validatedColumn($request, false);
        unset($validated['key']);

        if ($column->is_protected) {
            $validated = array_intersect_key($validated, array_flip(['is_hidden', 'sort_order']));
        }

        $column->update($validated);

        return response()->json(['data' => $column->refresh()]);
    }

    public function destroy(Request $request, string $module, DynamicTableColumn $column): JsonResponse
    {
        $this->authorizeSuperAdmin($request);
        abort_unless($column->module === $module, 404);
        abort_if($column->is_protected, 422, 'Protected columns cannot be deleted.');

        $column->delete();

        return response()->json(null, 204);
    }

    private function validatedColumn(Request $request, bool $keyRequired = true): array
    {
        return $request->validate([
            'key' => [$keyRequired ? 'nullable' : 'sometimes', 'nullable', 'string', 'max:80'],
            'label' => ['required', 'string', 'max:120'],
            'field_type' => ['required', Rule::in(DynamicTableSchemaService::FIELD_TYPES)],
            'options' => ['nullable', 'array'],
            'options.*' => ['string', 'max:120'],
            'is_required' => ['sometimes', 'boolean'],
            'is_hidden' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);
    }

    private function authorizeSuperAdmin(Request $request): void
    {
        abort_unless(
            in_array($request->user()?->role, ['Super Admin', 'Super Administrator'], true),
            403,
        );
    }
}
