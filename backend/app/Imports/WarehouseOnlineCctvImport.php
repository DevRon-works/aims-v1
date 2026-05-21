<?php

namespace App\Imports;

use App\Imports\Concerns\ImportsCctvRows;
use App\Models\WarehouseOnlineCctv;

class WarehouseOnlineCctvImport extends ImportsCctvRows
{
    protected function modelClass(): string
    {
        return WarehouseOnlineCctv::class;
    }

    protected function section(): string
    {
        return 'Warehouse / Online';
    }

    protected function requiredHeaders(): array
    {
        return ['BRANCH', 'BRAND', 'MODEL', 'SERIAL', 'USERNAME', 'PASSWORD', 'WEB IP', 'STORAGE'];
    }

    protected function rules(): array
    {
        return [
            'branch' => ['nullable', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'serial' => ['nullable', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],
            'web_ip' => ['nullable', 'ipv4'],
            'storage' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:Online,Offline'],
            'notes' => ['nullable', 'string'],
        ];
    }

    protected function payloadFromRow(array $data): array
    {
        return [
            'branch' => $this->stringOrNull($data['BRANCH'] ?? ''),
            'brand' => $this->stringOrNull($data['BRAND'] ?? ''),
            'model' => $this->stringOrNull($data['MODEL'] ?? ''),
            'serial' => $this->stringOrNull($data['SERIAL'] ?? ''),
            'username' => $this->stringOrNull($data['USERNAME'] ?? ''),
            'password' => $this->stringOrNull($data['PASSWORD'] ?? ''),
            'web_ip' => $this->stringOrNull($data['WEB IP'] ?? ''),
            'storage' => $this->stringOrNull($data['STORAGE'] ?? ''),
            'status' => $this->stringOrNull($data['STATUS'] ?? '') ?? 'Online',
            'notes' => $this->stringOrNull($data['NOTES'] ?? ''),
        ];
    }

    protected function compositeKeyFields(): array
    {
        return ['branch', 'brand', 'model', 'serial', 'web_ip', 'storage'];
    }
}
