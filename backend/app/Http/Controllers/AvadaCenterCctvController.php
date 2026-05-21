<?php

namespace App\Http\Controllers;

use App\Exports\CctvExport;
use App\Imports\AvadaCenterCctvImport;
use App\Models\CctvImportHistory;
use App\Models\AvadaCenterCctv;
use App\Services\DynamicTableValueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AvadaCenterCctvController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AvadaCenterCctv::query()->latest('updated_at');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search) {
                foreach (['floor_name', 'camera_number', 'camera_name', 'username', 'nvr_ip', 'camera_ip', 'status', 'notes'] as $column) {
                    $builder->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

        $records = $query->paginate($this->perPage($request));

        return response()->json([
            'data' => $records->getCollection()->map(fn (AvadaCenterCctv $record) => $this->toResource($record))->values(),
            'meta' => $this->paginationMeta($records),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $record = AvadaCenterCctv::query()->create($this->validatedData($request));

        return response()->json(['data' => $this->toResource($record)], 201);
    }

    public function show(AvadaCenterCctv $avadaCenterCctv): JsonResponse
    {
        return response()->json(['data' => $this->toResource($avadaCenterCctv)]);
    }

    public function update(Request $request, AvadaCenterCctv $avadaCenterCctv): JsonResponse
    {
        $avadaCenterCctv->update($this->validatedData($request));

        return response()->json(['data' => $this->toResource($avadaCenterCctv->refresh())]);
    }

    public function destroy(AvadaCenterCctv $avadaCenterCctv): JsonResponse
    {
        $avadaCenterCctv->delete();

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
            $summary = (new AvadaCenterCctvImport())->import(Storage::path($path), $request->user()?->name);
            $status = $summary['failed_rows'] > 0 ? 'failed' : 'completed';

            CctvImportHistory::query()->create([
                'section' => 'Avada Center',
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
        $filename = 'cctv-avada-center-'.now()->format('Y-m-d').'.'.$format;

        return Excel::download(
            new CctvExport(
                $this->exportQuery($request),
                ['Floor Name', 'Camera #', 'Camera Name', 'Username', 'Password', 'NVR IP', 'Camera IP'],
                ['floor_name', 'camera_number', 'camera_name', 'username', 'password', 'nvr_ip', 'camera_ip'],
            ),
            $filename,
            $format === 'csv' ? \Maatwebsite\Excel\Excel::CSV : \Maatwebsite\Excel\Excel::XLSX,
        );
    }

    private function validatedData(Request $request): array
    {
        $validated = $request->validate([
            'floor_name' => ['nullable', 'string', 'max:255'],
            'camera_number' => ['nullable', 'string', 'max:255'],
            'camera_name' => ['nullable', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],
            'nvr_ip' => ['nullable', 'ipv4'],
            'camera_ip' => ['nullable', 'ipv4'],
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

    private function toResource(AvadaCenterCctv $record): array
    {
        return [
            'id' => $record->id,
            'type' => 'Avada Center',
            'floor_name' => $record->floor_name,
            'camera_number' => $record->camera_number,
            'camera_name' => $record->camera_name,
            'branch' => null,
            'brand' => null,
            'working_cameras' => null,
            'model' => null,
            'serial' => null,
            'username' => $record->username,
            'password' => $record->password,
            'nvr_ip' => $record->nvr_ip,
            'camera_ip' => $record->camera_ip,
            'web_ip' => null,
            'storage' => null,
            'status' => $record->status,
            'notes' => $record->notes,
            'updated_by' => $record->updated_by,
            'last_updated' => optional($record->updated_at)->toDateTimeString(),
            'logs' => $record->logs ?? [],
            'custom_fields' => app(DynamicTableValueService::class)->values('cctv-avada-center', $record->id),
        ];
    }

    private function perPage(Request $request): int
    {
        return min(max((int) $request->query('per_page', 5), 1), 100);
    }

    private function exportQuery(Request $request)
    {
        $query = AvadaCenterCctv::query()->latest('updated_at');
        $scope = (string) $request->query('scope', 'filtered');

        if ($scope !== 'all' && $search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search) {
                foreach (['floor_name', 'camera_number', 'camera_name', 'username', 'nvr_ip', 'camera_ip', 'status', 'notes'] as $column) {
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
