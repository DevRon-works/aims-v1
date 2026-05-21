<?php

namespace App\Services;

use App\Models\DynamicTableColumn;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DynamicTableSchemaService
{
    public const FIELD_TYPES = [
        'text',
        'number',
        'email',
        'password',
        'date',
        'select',
        'textarea',
        'boolean',
        'status',
        'notes',
    ];

    public function columns(string $module): Collection
    {
        $this->seedFixedColumns($module);

        return DynamicTableColumn::query()
            ->where('module', $module)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function createCustomColumn(string $module, array $validated): DynamicTableColumn
    {
        $this->seedFixedColumns($module);
        $key = Str::camel($validated['key'] ?? $validated['label']);

        if (DynamicTableColumn::query()->where('module', $module)->where('key', $key)->exists()) {
            throw ValidationException::withMessages([
                'key' => ['This column key is already used in the module.'],
            ]);
        }

        return DynamicTableColumn::query()->create([
            ...$validated,
            'module' => $module,
            'key' => $key,
            'is_custom' => true,
            'is_protected' => false,
            'sort_order' => $this->nextSortOrder($module),
        ]);
    }

    public function seedFixedColumns(string $module): void
    {
        foreach ($this->fixedColumns($module) as $index => $definition) {
            DynamicTableColumn::query()->firstOrCreate(
                ['module' => $module, 'key' => $definition['key']],
                [
                    ...$definition,
                    'module' => $module,
                    'is_custom' => false,
                    'is_protected' => true,
                    'sort_order' => ($index + 1) * 10,
                ],
            );
        }
    }

    public function fixedColumns(string $module): array
    {
        return config("dynamic_tables.modules.{$module}.columns") ?? [
            ['key' => 'name', 'label' => 'Name', 'field_type' => 'text', 'options' => null, 'is_required' => false, 'is_hidden' => false],
            ['key' => 'owner', 'label' => 'Owner', 'field_type' => 'text', 'options' => null, 'is_required' => false, 'is_hidden' => false],
            ['key' => 'status', 'label' => 'Status', 'field_type' => 'status', 'options' => null, 'is_required' => false, 'is_hidden' => false],
            ['key' => 'updatedAt', 'label' => 'Updated', 'field_type' => 'date', 'options' => null, 'is_required' => false, 'is_hidden' => false],
        ];
    }

    private function nextSortOrder(string $module): int
    {
        return ((int) DynamicTableColumn::query()->where('module', $module)->max('sort_order')) + 10;
    }
}
