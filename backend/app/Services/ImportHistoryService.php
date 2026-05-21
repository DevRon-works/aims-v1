<?php

namespace App\Services;

use App\Models\AvadaCenterCctv;
use App\Models\BoutiqueCctv;
use App\Models\Email;
use App\Models\ImportHistory;
use App\Models\SystemLog;
use App\Models\WarehouseOnlineCctv;
use Illuminate\Http\Request;

class ImportHistoryService
{
    public function assertImportAllowed(Request $request, string $moduleName, string $importType = 'default'): void
    {
        $lockStatus = $this->lockStatus($moduleName, $importType);

        if ($lockStatus['locked'] && ! $this->isSuperAdmin($request)) {
            abort(response()->json([
                'message' => $lockStatus['lock_reason'],
                'module_name' => $moduleName,
                'import_type' => $importType,
                'current_record_count' => $lockStatus['current_record_count'],
            ], 409));
        }
    }

    public function start(string $moduleName, string $importType, ?string $fileName, ?string $actor): ImportHistory
    {
        return ImportHistory::query()->create([
            'module_name' => $moduleName,
            'import_type' => $importType,
            'file_name' => $fileName,
            'status' => 'processing',
            'imported_by' => $actor,
        ]);
    }

    public function finish(ImportHistory $history, array $summary, string $status): void
    {
        $history->update([
            'status' => $status,
            'total_rows' => $summary['total_rows'] ?? 0,
            'imported_rows' => $summary['imported_rows'] ?? 0,
            'failed_rows' => $summary['failed_rows'] ?? 0,
            'imported_at' => now(),
        ]);
    }

    public function hasSuccessfulImport(string $moduleName, string $importType = 'default'): bool
    {
        return $this->lockStatus($moduleName, $importType)['locked'];
    }

    public function status(?string $moduleName = null): array
    {
        $query = ImportHistory::query()->latest('updated_at');

        if ($moduleName) {
            $query->where('module_name', $moduleName);
        }

        return $query
            ->get()
            ->groupBy(fn (ImportHistory $history) => $history->module_name.'::'.$history->import_type)
            ->map(function ($rows) {
                $latest = $rows->first();
                $lockStatus = $this->lockStatus($latest->module_name, $latest->import_type);

                return [
                    'module_name' => $latest->module_name,
                    'import_type' => $latest->import_type,
                    'status' => $latest->status,
                    'locked' => $lockStatus['locked'],
                    'lock_reason' => $lockStatus['lock_reason'],
                    'current_record_count' => $lockStatus['current_record_count'],
                    'file_name' => $latest->file_name,
                    'total_rows' => $latest->total_rows,
                    'imported_rows' => $latest->imported_rows,
                    'failed_rows' => $latest->failed_rows,
                    'imported_by' => $latest->imported_by,
                    'imported_at' => optional($latest->imported_at)->toDateTimeString(),
                ];
            })
            ->values()
            ->all();
    }

    public function recompute(string $moduleName, string $importType = 'default'): array
    {
        $latest = ImportHistory::query()
            ->where('module_name', $moduleName)
            ->where('import_type', $importType)
            ->latest('updated_at')
            ->first();
        $lockStatus = $this->lockStatus($moduleName, $importType);

        return [
            'module_name' => $moduleName,
            'import_type' => $importType,
            'status' => $latest?->status,
            'locked' => $lockStatus['locked'],
            'lock_reason' => $lockStatus['lock_reason'],
            'current_record_count' => $lockStatus['current_record_count'],
            'file_name' => $latest?->file_name,
            'total_rows' => $latest?->total_rows ?? 0,
            'imported_rows' => $latest?->imported_rows ?? 0,
            'failed_rows' => $latest?->failed_rows ?? 0,
            'imported_by' => $latest?->imported_by,
            'imported_at' => optional($latest?->imported_at)->toDateTimeString(),
        ];
    }

    public function reset(Request $request, string $moduleName, string $importType = 'default'): void
    {
        if (! $this->isSuperAdmin($request)) {
            abort(response()->json(['message' => 'Only Super Admin can reset import locks.'], 403));
        }

        ImportHistory::query()
            ->where('module_name', $moduleName)
            ->where('import_type', $importType)
            ->where('status', 'success')
            ->update(['status' => 'failed']);

        SystemLog::query()->create([
            'module_name' => $moduleName,
            'action' => 'reset_import_lock',
            'detail' => "Reset import lock for {$moduleName} / {$importType}.",
            'actor' => $request->user()?->name ?? $this->actorFromRequest($request),
            'metadata' => ['import_type' => $importType],
        ]);
    }

    public function isSuperAdmin(Request $request): bool
    {
        $role = (string) ($request->user()?->role ?? '');
        $authorization = (string) $request->header('Authorization', '');

        return in_array($role, ['Super Administrator', 'Super Admin'], true)
            || str_contains($authorization, 'usr-superadmin');
    }

    public function actorFromRequest(Request $request): ?string
    {
        if (str_contains((string) $request->header('Authorization', ''), 'usr-superadmin')) {
            return 'Super Admin';
        }

        return $request->user()?->name;
    }

    private function lockStatus(string $moduleName, string $importType): array
    {
        $currentRecordCount = $this->currentRecordCount($moduleName, $importType);
        $successfulHistory = ImportHistory::query()
            ->where('module_name', $moduleName)
            ->where('import_type', $importType)
            ->where('status', 'success')
            ->where('imported_rows', '>', 0)
            ->latest('updated_at')
            ->first();
        $locked = $successfulHistory !== null && $currentRecordCount > 0;

        return [
            'locked' => $locked,
            'lock_reason' => $locked
                ? "Import is locked because {$moduleName} / {$importType} has a successful import with {$successfulHistory->imported_rows} imported rows and {$currentRecordCount} current records."
                : null,
            'current_record_count' => $currentRecordCount,
        ];
    }

    private function currentRecordCount(string $moduleName, string $importType): int
    {
        return match ($moduleName) {
            'emails' => Email::query()->count(),
            'cctv' => match ($importType) {
                'Avada Center' => AvadaCenterCctv::query()->count(),
                'Boutique' => BoutiqueCctv::query()->count(),
                'Warehouse / Online' => WarehouseOnlineCctv::query()->count(),
                default => 0,
            },
            default => 0,
        };
    }
}
