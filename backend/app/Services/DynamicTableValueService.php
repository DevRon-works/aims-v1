<?php

namespace App\Services;

use App\Models\DynamicTableColumn;
use App\Models\DynamicTableValue;
use Illuminate\Validation\ValidationException;

class DynamicTableValueService
{
    public function values(string $module, string|int $recordId): array
    {
        return DynamicTableValue::query()
            ->where('module', $module)
            ->where('record_id', (string) $recordId)
            ->with('column:id,key')
            ->get()
            ->mapWithKeys(fn (DynamicTableValue $value) => [
                $value->column->key => $value->value['value'] ?? null,
            ])
            ->all();
    }

    public function sync(string $module, string|int $recordId, array $values): array
    {
        $columns = DynamicTableColumn::query()
            ->where('module', $module)
            ->where('is_custom', true)
            ->get()
            ->keyBy('key');

        $errors = [];

        foreach ($values as $key => $value) {
            $column = $columns->get($key);

            if (! $column) {
                $errors["custom_fields.{$key}"][] = 'The custom column does not exist.';
                continue;
            }

            $message = $this->validationMessage($column, $value);

            if ($message) {
                $errors["custom_fields.{$key}"][] = $message;
                continue;
            }

            DynamicTableValue::query()->updateOrCreate(
                [
                    'module' => $module,
                    'record_id' => (string) $recordId,
                    'dynamic_table_column_id' => $column->id,
                ],
                ['value' => ['value' => $this->normalizeValue($column, $value)]],
            );
        }

        if ($errors) {
            throw ValidationException::withMessages($errors);
        }

        return $this->values($module, $recordId);
    }

    private function validationMessage(DynamicTableColumn $column, mixed $value): ?string
    {
        if ($column->is_required && ($value === null || $value === '')) {
            return "{$column->label} is required.";
        }

        if ($value === null || $value === '') {
            return null;
        }

        return match ($column->field_type) {
            'number' => is_numeric($value) ? null : "{$column->label} must be a number.",
            'email' => filter_var($value, FILTER_VALIDATE_EMAIL)
                ? null
                : "{$column->label} must be a valid email.",
            'date' => strtotime((string) $value) !== false
                ? null
                : "{$column->label} must be a valid date.",
            'boolean' => in_array($value, [true, false, 0, 1, '0', '1'], true)
                ? null
                : "{$column->label} must be true or false.",
            'select' => in_array($value, $column->options ?? [], true)
                ? null
                : "{$column->label} must match an available option.",
            default => is_scalar($value) ? null : "{$column->label} must be a simple value.",
        };
    }

    private function normalizeValue(DynamicTableColumn $column, mixed $value): mixed
    {
        return match ($column->field_type) {
            'number' => $value === '' || $value === null ? null : (float) $value,
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            default => $value,
        };
    }
}
