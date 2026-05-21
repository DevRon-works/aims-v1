<?php

namespace App\Imports;

use App\Imports\Concerns\ImportsCctvRows;
use App\Models\AvadaCenterCctv;

class AvadaCenterCctvImport extends ImportsCctvRows
{
    protected function modelClass(): string
    {
        return AvadaCenterCctv::class;
    }

    protected function section(): string
    {
        return 'Avada Center';
    }

    protected function requiredHeaders(): array
    {
        return ['FLOOR NAME', 'CAMERA #', 'CAMERA NAME', 'USERNAME', 'PASSWORD', 'NVR IP', 'CAMERA IP'];
    }

    protected function rules(): array
    {
        return [
            'floor_name' => ['nullable', 'string', 'max:255'],
            'camera_number' => ['nullable', 'string', 'max:255'],
            'camera_name' => ['nullable', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],
            'nvr_ip' => ['nullable', 'ipv4'],
            'camera_ip' => ['nullable', 'ipv4'],
            'status' => ['nullable', 'string', 'in:Online,Offline'],
            'notes' => ['nullable', 'string'],
        ];
    }

    protected function payloadFromRow(array $data): array
    {
        return [
            'floor_name' => $this->stringOrNull($data['FLOOR NAME'] ?? ''),
            'camera_number' => $this->stringOrNull($data['CAMERA #'] ?? ''),
            'camera_name' => $this->stringOrNull($data['CAMERA NAME'] ?? ''),
            'username' => $this->stringOrNull($data['USERNAME'] ?? ''),
            'password' => $this->stringOrNull($data['PASSWORD'] ?? ''),
            'nvr_ip' => $this->stringOrNull($data['NVR IP'] ?? ''),
            'camera_ip' => $this->stringOrNull($data['CAMERA IP'] ?? ''),
            'status' => $this->stringOrNull($data['STATUS'] ?? '') ?? 'Online',
            'notes' => $this->stringOrNull($data['NOTES'] ?? ''),
        ];
    }

    protected function compositeKeyFields(): array
    {
        return ['floor_name', 'camera_number', 'camera_name', 'nvr_ip', 'camera_ip'];
    }
}
