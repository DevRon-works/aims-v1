<?php

namespace App\Imports;

use App\Models\Email;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class EmailImport
{
    private const REQUIRED_HEADERS = [
        'EMAILS TYPE',
        'EMAIL ACCOUNT',
        'PASSWORD',
        'DEPARTMENT',
        'PERSON USED',
        'PURPOSE',
        'RECOVERY EMAIL',
        'RECOVERY NUMBER & VERIFICATION',
    ];

    public function import(UploadedFile $file, ?string $updatedBy = null): array
    {
        $rows = $this->readRows($file);
        $existingRows = $this->existingRowFingerprints();

        $seen = [];
        $insertRows = [];
        $errors = [];
        $totalRows = 0;
        $skippedRows = 0;

        foreach ($rows as $row) {
            $rowNumber = $row['row'];
            $data = $row['data'];

            if ($this->isEmptyRow($data)) {
                $skippedRows++;
                continue;
            }

            $totalRows++;
            $payload = $this->normalizePayload($data);
            $payload['recovery_email'] = $this->validEmailOrNull($payload['recovery_email']);
            $fingerprint = $this->rowFingerprint($payload);

            $validator = Validator::make($payload, [
                'emails_type' => ['required', 'string', 'max:255'],
                'email_account' => ['required', 'email', 'max:255'],
                'password' => ['nullable', 'string'],
                'department' => ['nullable', 'string', 'max:255'],
                'person_used' => ['nullable', 'string', 'max:255'],
                'purpose' => ['nullable', 'string'],
                'recovery_email' => ['nullable', 'email', 'max:255'],
                'recovery_number_verification' => ['nullable', 'string'],
            ]);

            if ($validator->fails()) {
                array_push($errors, ...$this->formatValidationErrors(
                    $rowNumber,
                    $payload['email_account'],
                    $validator->errors()->messages(),
                ));
                continue;
            }

            if (isset($existingRows[$fingerprint])) {
                $skippedRows++;
                $errors[] = $this->duplicateError($rowNumber, $payload['email_account']);
                continue;
            }

            if (isset($seen[$fingerprint])) {
                $skippedRows++;
                $errors[] = $this->duplicateError($rowNumber, $payload['email_account']);
                continue;
            }

            $seen[$fingerprint] = true;
            $now = now();
            $insertRows[] = [
                'emails_type' => $payload['emails_type'],
                'email_account' => $payload['email_account'],
                'password' => $payload['password'] !== null ? Crypt::encryptString($payload['password']) : null,
                'department' => $payload['department'],
                'person_used' => $payload['person_used'],
                'purpose' => $payload['purpose'],
                'recovery_email' => $payload['recovery_email'],
                'recovery_number_verification' => $payload['recovery_number_verification'],
                'updated_by' => $updatedBy,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        foreach (array_chunk($insertRows, 500) as $chunk) {
            DB::table('emails')->insert($chunk);
        }

        return [
            'total_rows' => $totalRows,
            'imported_rows' => count($insertRows),
            'skipped_rows' => $skippedRows,
            'failed_rows' => count(array_unique(array_column($errors, 'row'))),
            'validation_errors' => $errors,
        ];
    }

    private function readRows(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if (in_array($extension, ['xlsx', 'xls'], true)) {
            return $this->readExcelRows($file);
        }

        return $this->readCsvRows($file);
    }

    private function readExcelRows(UploadedFile $file): array
    {
        if (! class_exists(\Maatwebsite\Excel\Facades\Excel::class)) {
            throw new \InvalidArgumentException('XLSX import requires Laravel Excel. Run composer install or composer update maatwebsite/excel, then retry.');
        }

        $import = new class implements \Maatwebsite\Excel\Concerns\ToArray {
            public array $rows = [];

            public function array(array $array): void
            {
                $this->rows = $array;
            }
        };

        \Maatwebsite\Excel\Facades\Excel::import($import, $file);

        return $this->rowsFromArray($import->rows);
    }

    private function readCsvRows(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');

        if ($handle === false) {
            throw new \RuntimeException('Unable to read import file.');
        }

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = $row;
        }
        fclose($handle);

        return $this->rowsFromArray($rows);
    }

    private function rowsFromArray(array $rows): array
    {
        $headerRow = array_shift($rows) ?? [];
        $headers = array_map(fn ($value) => $this->normalizeHeader((string) $value), $headerRow);
        $missingHeaders = array_diff(self::REQUIRED_HEADERS, $headers);

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

    private function normalizePayload(array $data): array
    {
        return [
            'emails_type' => $this->stringOrNull($data['EMAILS TYPE'] ?? ''),
            'email_account' => $this->emailOrNull($data['EMAIL ACCOUNT'] ?? '') ?? '',
            'password' => $this->stringOrNull($data['PASSWORD'] ?? ''),
            'department' => $this->stringOrNull($data['DEPARTMENT'] ?? ''),
            'person_used' => $this->stringOrNull($data['PERSON USED'] ?? ''),
            'purpose' => $this->stringOrNull($data['PURPOSE'] ?? ''),
            'recovery_email' => $this->emailOrNull($data['RECOVERY EMAIL'] ?? ''),
            'recovery_number_verification' => $this->stringOrNull($data['RECOVERY NUMBER & VERIFICATION'] ?? ''),
        ];
    }

    private function existingRowFingerprints(): array
    {
        return Email::query()
            ->get([
                'emails_type',
                'email_account',
                'password',
                'department',
                'person_used',
                'purpose',
                'recovery_email',
                'recovery_number_verification',
            ])
            ->mapWithKeys(function (Email $email) {
                $payload = [
                    'emails_type' => $this->stringOrNull($email->emails_type),
                    'email_account' => $this->emailOrNull($email->email_account) ?? '',
                    'password' => $this->stringOrNull($this->plainPassword($email->password)),
                    'department' => $this->stringOrNull($email->department),
                    'person_used' => $this->stringOrNull($email->person_used),
                    'purpose' => $this->stringOrNull($email->purpose),
                    'recovery_email' => $this->validEmailOrNull($this->emailOrNull($email->recovery_email)),
                    'recovery_number_verification' => $this->stringOrNull($email->recovery_number_verification),
                ];

                return [$this->rowFingerprint($payload) => true];
            })
            ->all();
    }

    private function rowFingerprint(array $payload): string
    {
        return hash('sha256', json_encode([
            'emails_type' => $payload['emails_type'],
            'email_account' => $payload['email_account'],
            'password' => $payload['password'],
            'department' => $payload['department'],
            'person_used' => $payload['person_used'],
            'purpose' => $payload['purpose'],
            'recovery_email' => $payload['recovery_email'],
            'recovery_number_verification' => $payload['recovery_number_verification'],
        ], JSON_THROW_ON_ERROR));
    }

    private function plainPassword(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Throwable) {
            return $value;
        }
    }

    private function duplicateError(int $rowNumber, string $email): array
    {
        return [
            'row' => $rowNumber,
            'email' => $email,
            'column' => 'row',
            'reason' => 'Exact duplicate row already exists.',
            'errors' => ['row: Exact duplicate row already exists.'],
        ];
    }

    private function stringOrNull(mixed $value): ?string
    {
        $value = trim((string) $value);
        $value = preg_replace('/\s+/', ' ', $value) ?? $value;

        return $value === '' ? null : $value;
    }

    private function emailOrNull(mixed $value): ?string
    {
        $value = $this->stringOrNull($value);

        return $value === null ? null : strtolower($value);
    }

    private function validEmailOrNull(?string $value): ?string
    {
        return $value !== null && filter_var($value, FILTER_VALIDATE_EMAIL) ? $value : null;
    }

    private function formatValidationErrors(int $rowNumber, ?string $email, array $messages): array
    {
        return collect($messages)
            ->flatMap(fn (array $fieldMessages, string $column) => collect($fieldMessages)->map(fn (string $message) => [
                'row' => $rowNumber,
                'email' => $email,
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
