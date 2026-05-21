<?php

namespace App\Imports\Concerns;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\ToArray;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\File\UploadedFile;

abstract class ImportsCctvRows
{
    abstract protected function modelClass(): string;

    abstract protected function section(): string;

    abstract protected function requiredHeaders(): array;

    abstract protected function rules(): array;

    abstract protected function payloadFromRow(array $data): array;

    abstract protected function compositeKeyFields(): array;

    public function import(UploadedFile|string $file, ?string $updatedBy = null): array
    {
        $rows = $this->readRows($file);
        $errors = [];
        $insertPayloads = [];
        $updatePayloads = [];
        $seenRows = [];
        $totalRows = 0;
        $skippedDuplicateRows = 0;

        foreach ($rows as $row) {
            $rowNumber = $row['row'];
            $data = $row['data'];

            if ($this->isEmptyRow($data)) {
                continue;
            }

            $totalRows++;
            $payload = $this->payloadFromRow($data);
            $validator = Validator::make($payload, $this->rules());

            if ($validator->fails()) {
                array_push($errors, ...$this->formatValidationErrors($rowNumber, $validator->errors()->messages()));
                continue;
            }

            $payload['updated_by'] = $updatedBy;
            $payload['logs'] = [[
                'actor' => $updatedBy ?? 'System',
                'detail' => 'Imported from CCTV workbook.',
                'timestamp' => now()->toDateTimeString(),
            ]];

            $rowFingerprint = $this->rowFingerprint($payload);

            if (isset($seenRows[$rowFingerprint])) {
                $skippedDuplicateRows++;
                continue;
            }

            $seenRows[$rowFingerprint] = true;
            $existing = $this->findExistingByComposite($payload);

            if ($existing === null) {
                $insertPayloads[] = $payload;
                continue;
            }

            if ($this->rowFingerprint($existing->only($this->identityFields())) === $rowFingerprint) {
                $skippedDuplicateRows++;
                continue;
            }

            $updatePayloads[] = [$existing, $payload];
        }

        if ($errors !== []) {
            return [
                'total_rows' => $totalRows,
                'imported_rows' => 0,
                'skipped_duplicate_rows' => 0,
                'updated_rows' => 0,
                'failed_rows' => count(array_unique(array_column($errors, 'row'))),
                'validation_errors' => $errors,
                'rolled_back' => true,
            ];
        }

        DB::transaction(function () use ($insertPayloads, $updatePayloads) {
            $modelClass = $this->modelClass();

            foreach (array_chunk($insertPayloads, 500) as $chunk) {
                $modelClass::query()->insert(array_map(function (array $payload) {
                    return [
                        ...$payload,
                        'logs' => json_encode($payload['logs']),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }, $chunk));
            }

            foreach ($updatePayloads as [$model, $payload]) {
                $model->update($payload);
            }
        });

        return [
            'total_rows' => $totalRows,
            'imported_rows' => count($insertPayloads),
            'skipped_duplicate_rows' => $skippedDuplicateRows,
            'updated_rows' => count($updatePayloads),
            'failed_rows' => 0,
            'validation_errors' => [],
            'rolled_back' => false,
        ];
    }

    private function readRows(UploadedFile|string $file): array
    {
        $import = new class implements ToArray {
            public array $rows = [];

            public function array(array $array): void
            {
                $this->rows = $array;
            }
        };

        Excel::import($import, $file);

        return $this->rowsFromArray($import->rows);
    }

    private function rowsFromArray(array $rows): array
    {
        $headerRow = array_shift($rows) ?? [];
        $headers = array_map(fn ($value) => $this->normalizeHeader((string) $value), $headerRow);
        $missingHeaders = array_diff($this->requiredHeaders(), $headers);

        if ($missingHeaders) {
            throw new \InvalidArgumentException('Missing required columns: '.implode(', ', $missingHeaders));
        }

        return collect($rows)
            ->map(function ($row, $index) use ($headers) {
                $values = array_pad((array) $row, count($headers), '');
                $data = [];

                foreach ($headers as $position => $header) {
                    $data[$header] = trim((string) ($values[$position] ?? ''));
                }

                return [
                    'row' => $index + 2,
                    'data' => $data,
                ];
            })
            ->values()
            ->all();
    }

    protected function stringOrNull(mixed $value): ?string
    {
        $value = trim((string) $value);
        $value = preg_replace('/\s+/', ' ', $value) ?? $value;

        return $value === '' ? null : $value;
    }

    private function findExistingByComposite(array $payload): ?object
    {
        $query = $this->modelClass()::query();

        foreach ($this->compositeKeyFields() as $field) {
            $value = $payload[$field] ?? null;

            if ($value === null || $value === '') {
                $query->whereNull($field);
            } else {
                $query->where($field, $value);
            }
        }

        return $query->first();
    }

    private function identityFields(): array
    {
        return array_keys($this->rules());
    }

    private function rowFingerprint(array $payload): string
    {
        $identity = [];

        foreach ($this->identityFields() as $field) {
            $value = $payload[$field] ?? null;
            $identity[$field] = is_string($value) ? trim($value) : $value;
        }

        ksort($identity);

        return hash('sha256', json_encode($identity, JSON_THROW_ON_ERROR));
    }

    private function formatValidationErrors(int $rowNumber, array $messages): array
    {
        return collect($messages)
            ->flatMap(fn (array $fieldMessages, string $column) => collect($fieldMessages)->map(fn (string $message) => [
                'row' => $rowNumber,
                'column' => $column,
                'reason' => $message,
                'errors' => ["{$column}: {$message}"],
            ]))
            ->values()
            ->all();
    }

    private function isEmptyRow(array $data): bool
    {
        return collect($data)->every(fn ($value) => trim((string) $value) === '');
    }

    private function normalizeHeader(string $value): string
    {
        $value = preg_replace('/^\xEF\xBB\xBF/', '', $value) ?? $value;

        return preg_replace('/\s+/', ' ', strtoupper(trim($value))) ?? '';
    }
}
