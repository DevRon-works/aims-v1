<?php

namespace App\Http\Controllers;

use App\Exports\CctvExport;
use App\Imports\WarehouseOnlineCctvImport;
use App\Models\CctvImportHistory;
use App\Models\WarehouseOnlineCctv;
use App\Services\DynamicTableValueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class WarehouseOnlineCctvController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = WarehouseOnlineCctv::query()->latest('updated_at');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search) {
                foreach (['branch', 'brand', 'model', 'serial', 'username', 'web_ip', 'storage', 'status', 'notes'] as $column) {
                    $builder->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

        $records = $query->paginate($this->perPage($request));

        return response()->json([
            'data' => $records->getCollection()->map(fn (WarehouseOnlineCctv $record) => $this->toResource($record))->values(),
            'meta' => $this->paginationMeta($records),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $record = WarehouseOnlineCctv::query()->create($this->validatedData($request));

        return response()->json(['data' => $this->toResource($record)], 201);
    }

    public function show(WarehouseOnlineCctv $warehouseOnlineCctv): JsonResponse
    {
        return response()->json(['data' => $this->toResource($warehouseOnlineCctv)]);
    }

    public function update(Request $request, WarehouseOnlineCctv $warehouseOnlineCctv): JsonResponse
    {
        $warehouseOnlineCctv->update($this->validatedData($request));

        return response()->json(['data' => $this->toResource($warehouseOnlineCctv->refresh())]);
    }

    public function destroy(WarehouseOnlineCctv $warehouseOnlineCctv): JsonResponse
    {
        $warehouseOnlineCctv->delete();

        return response()->json(null, 204);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv,txt'],
        ]);

        $file = $request->file('file');
        $path = $file->store('tmp/cctv-imports');

        try {
            $summary = (new WarehouseOnlineCctvImport())->import(Storage::path($path), $request->user()?->name);
            $status = $summary['failed_rows'] > 0 ? 'failed' : 'completed';

            CctvImportHistory::query()->create([
                'section' => 'Warehouse / Online',
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
                'message' => $status === 'completed' ? 'CCTV import completed.' : 'CCTV import failed. No rows were saved.',
            ], $status === 'completed' ? 200 : 422);
        } catch (\InvalidArgumentException $error) {
            return response()->json([
                'message' => $error->getMessage(),
                'total_rows' => 0,
                'imported_rows' => 0,
                'skipped_duplicate_rows' => 0,
                'updated_rows' => 0,
                'failed_rows' => 0,
                'validation_errors' => [],
            ], 422);
        } finally {
            Storage::delete($path);
        }
    }

    public function export(Request $request): BinaryFileResponse
    {
        $format = strtolower((string) $request->query('format', 'xlsx')) === 'csv' ? 'csv' : 'xlsx';
        $filename = 'cctv-warehouse-online-'.now()->format('Y-m-d').'.'.$format;

        return Excel::download(
            new CctvExport(
                $this->exportQuery($request),
                ['Branch', 'Brand', 'Model', 'Serial', 'Username', 'Password', 'Web IP', 'Storage', 'Status'],
                ['branch', 'brand', 'model', 'serial', 'username', 'password', 'web_ip', 'storage', 'status'],
            ),
            $filename,
            $format === 'csv' ? \Maatwebsite\Excel\Excel::CSV : \Maatwebsite\Excel\Excel::XLSX,
        );
    }

    private function validatedData(Request $request): array
    {
        $validated = $request->validate([
            'branch' => ['nullable', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'serial' => ['nullable', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],
            'web_ip' => ['nullable', 'ipv4'],
            'storage' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'in:Online,Offline'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['updated_by'] = $request->user()?->name;
        $validated['logs'] = [[
            'actor' => $request->user()?->name ?? 'System',
            'detail' => 'CCTV record saved.',
            'timestamp' => now()->toDateTimeString(),
        ]];

        return $validated;
    }

    private function toResource(WarehouseOnlineCctv $record): array
    {
        return [
            'id' => $record->id,
            'type' => 'Warehouse / Online',
            'floor_name' => null,
            'camera_number' => null,
            'camera_name' => null,
            'branch' => $record->branch,
            'brand' => $record->brand,
            'working_cameras' => null,
            'model' => $record->model,
            'serial' => $record->serial,
            'username' => $record->username,
            'password' => $record->password,
            'nvr_ip' => null,
            'camera_ip' => null,
            'web_ip' => $record->web_ip,
            'storage' => $record->storage,
            'status' => $record->status,
            'notes' => $record->notes,
            'updated_by' => $record->updated_by,
            'last_updated' => optional($record->updated_at)->toDateTimeString(),
            'logs' => $record->logs ?? [],
            'custom_fields' => app(DynamicTableValueService::class)->values('cctv-warehouse-online', $record->id),
        ];
    }

    private function perPage(Request $request): int
    {
        return min(max((int) $request->query('per_page', 5), 1), 100);
    }

    private function exportQuery(Request $request)
    {
        $query = WarehouseOnlineCctv::query()->latest('updated_at');
        $scope = (string) $request->query('scope', 'filtered');

        if ($scope !== 'all' && $search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search) {
                foreach (['branch', 'brand', 'model', 'serial', 'username', 'web_ip', 'storage', 'status', 'notes'] as $column) {
                    $builder->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

        if ($scope === 'current') {
            $query->forPage((int) $request->query('page', 1), $this->perPage($request));
        }

        return $query;
    }

    private function paginationMeta($records): array
    {
        return [
            'current_page' => $records->currentPage(),
            'last_page' => $records->lastPage(),
            'per_page' => $records->perPage(),
            'total' => $records->total(),
            'from' => $records->firstItem(),
            'to' => $records->lastItem(),
        ];
    }
}
