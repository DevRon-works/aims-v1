<?php

namespace App\Http\Controllers;

use App\Imports\EmailImport;
use App\Models\Email;
use App\Services\ImportHistoryService;
use App\Services\DynamicTableValueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmailController extends Controller
{
    private const EXPORT_HEADERS = [
        'EMAILS TYPE',
        'EMAIL ACCOUNT',
        'PASSWORD',
        'DEPARTMENT',
        'PERSON USED',
        'PURPOSE',
        'RECOVERY EMAIL',
        'RECOVERY NUMBER & VERIFICATION',
    ];

    public function index(Request $request): JsonResponse
    {
        $query = Email::query()->latest('updated_at');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search) {
                foreach ([
                    'emails_type',
                    'email_account',
                    'department',
                    'person_used',
                    'purpose',
                    'recovery_email',
                    'recovery_number_verification',
                ] as $column) {
                    $builder->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

        foreach (['emails_type', 'department'] as $filter) {
            if ($value = trim((string) $request->query($filter, ''))) {
                $query->where($filter, $value);
            }
        }

        return response()->json([
            'data' => $query->get()->map(fn (Email $email) => $this->toResource($email))->values(),
        ]);
    }

    public function options(): JsonResponse
    {
        $emailTypes = $this->uniqueOptions('emails_type');

        return response()->json([
            'emails_types' => $emailTypes,
            'providers' => $emailTypes,
            'departments' => $this->uniqueOptions('department'),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $email = Email::query()->create($this->validatedData($request));

        return response()->json(['data' => $this->toResource($email, true)], 201);
    }

    public function show(Request $request, Email $email): JsonResponse
    {
        return response()->json([
            'data' => $this->toResource($email, $request->boolean('with_secret')),
        ]);
    }

    public function update(Request $request, Email $email): JsonResponse
    {
        $email->update($this->validatedData($request, $email));

        return response()->json(['data' => $this->toResource($email->refresh(), true)]);
    }

    public function destroy(Email $email): Response
    {
        $email->delete();

        return response(null, 204);
    }

    public function import(Request $request, ImportHistoryService $imports): JsonResponse
    {
        $imports->assertImportAllowed($request, 'emails', 'default');
        $request->validate($request->hasFile('file') ? [
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv,txt'],
        ] : [
            'file_name' => ['required', 'string'],
            'file_base64' => ['required', 'string'],
        ]);

        try {
            $file = $request->hasFile('file') ? $request->file('file') : $this->uploadedFileFromBase64($request);
            $history = $imports->start('emails', 'default', $file->getClientOriginalName(), $imports->actorFromRequest($request));
            $summary = (new EmailImport())->import($file, $request->user()?->name);
            $imports->finish($history, $summary, 'success');
        } catch (\InvalidArgumentException $error) {
            if (isset($history)) {
                $imports->finish($history, ['total_rows' => 0, 'imported_rows' => 0, 'failed_rows' => 0], 'failed');
            }
            return response()->json([
                'message' => $error->getMessage(),
                'total_rows' => 0,
                'imported_rows' => 0,
                'skipped_rows' => 0,
                'failed_rows' => 0,
                'validation_errors' => [],
            ], 422);
        } catch (\RuntimeException $error) {
            if (isset($history)) {
                $imports->finish($history, ['total_rows' => 0, 'imported_rows' => 0, 'failed_rows' => 0], 'failed');
            }
            return response()->json([
                'message' => 'Import failed. Please review the file and try again.',
                'total_rows' => 0,
                'imported_rows' => 0,
                'skipped_rows' => 0,
                'failed_rows' => 0,
                'validation_errors' => [],
            ], 500);
        } catch (\Throwable $error) {
            report($error);
            if (isset($history)) {
                $imports->finish($history, ['total_rows' => 0, 'imported_rows' => 0, 'failed_rows' => 0], 'failed');
            }

            return response()->json([
                'message' => 'Import failed. Please review the file and try again.',
                'total_rows' => 0,
                'imported_rows' => 0,
                'skipped_rows' => 0,
                'failed_rows' => 0,
                'validation_errors' => [],
            ], 500);
        } finally {
            if (isset($file) && str_contains($file->getPathname(), storage_path('app/tmp/import-'))) {
                @unlink($file->getPathname());
            }
        }

        return response()->json([
            ...$summary,
            'message' => 'Import completed.',
        ]);
    }

    public function export(Request $request): StreamedResponse|Response
    {
        $format = strtolower((string) $request->query('format', 'csv'));

        if ($format === 'pdf') {
            return response($this->buildPdfExport(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="emails-'.now()->format('Ymd-His').'.pdf"',
            ]);
        }

        $filename = 'emails-'.now()->format('Ymd-His').'.csv';

        return response()->stream(function () {
            $out = fopen('php://output', 'w');
            fputcsv($out, self::EXPORT_HEADERS);

            Email::query()->latest('updated_at')->chunk(200, function ($emails) use ($out) {
                foreach ($emails as $email) {
                    fputcsv($out, [
                        $email->emails_type,
                        $email->email_account,
                        $email->password,
                        $email->department,
                        $email->person_used,
                        $email->purpose,
                        $email->recovery_email,
                        $email->recovery_number_verification,
                    ]);
                }
            });

            fclose($out);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    private function validatedData(Request $request, ?Email $email = null): array
    {
        $validated = $request->validate($this->rules($email));
        $validated['updated_by'] = $request->user()?->name;

        return $validated;
    }

    private function uploadedFileFromBase64(Request $request): UploadedFile
    {
        $fileName = basename((string) $request->input('file_name'));
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        if (! in_array($extension, ['xlsx', 'xls', 'csv', 'txt'], true)) {
            throw new \InvalidArgumentException('The import file must be an xlsx, xls, csv, or txt file.');
        }

        $base64 = (string) $request->input('file_base64');
        $base64 = preg_replace('/^data:.*;base64,/', '', $base64) ?? $base64;
        $contents = base64_decode($base64, true);

        if ($contents === false) {
            throw new \InvalidArgumentException('The import file could not be decoded.');
        }

        $directory = storage_path('app/tmp');

        if (! is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        $path = $directory.'/import-'.str()->uuid().'.'.$extension;
        file_put_contents($path, $contents);

        return new UploadedFile($path, $fileName, null, null, true);
    }

    private function rules(?Email $email = null): array
    {
        return [
            'emails_type' => ['required', 'string', 'max:255'],
            'email_account' => [
                'required',
                'email',
                'max:255',
            ],
            'password' => ['nullable', 'string'],
            'department' => ['nullable', 'string', 'max:255'],
            'person_used' => ['nullable', 'string', 'max:255'],
            'purpose' => ['nullable', 'string'],
            'recovery_email' => ['nullable', 'email', 'max:255'],
            'recovery_number_verification' => ['nullable', 'string'],
        ];
    }

    private function rowToPayload(array $header, array $row): array
    {
        $normalized = array_map(fn ($value) => $this->normalizeHeader((string) $value), $header);
        $data = array_combine($normalized, array_pad($row, count($normalized), '')) ?: [];
        $headers = [
            'emails_type' => 'EMAILS TYPE',
            'email_account' => 'EMAIL ACCOUNT',
            'password' => 'PASSWORD',
            'department' => 'DEPARTMENT',
            'person_used' => 'PERSON USED',
            'purpose' => 'PURPOSE',
            'recovery_email' => 'RECOVERY EMAIL',
            'recovery_number_verification' => 'RECOVERY NUMBER & VERIFICATION',
        ];

        $payload = [];

        foreach ($headers as $field => $label) {
            $payload[$field] = trim((string) ($data[$this->normalizeHeader($label)] ?? ''));
        }

        return $payload;
    }

    private function toResource(Email $email, bool $withSecret = false): array
    {
        return [
            'id' => $email->id,
            'emails_type' => $email->emails_type,
            'email_account' => $email->email_account,
            'password' => $withSecret ? $email->password : null,
            'has_password' => filled($email->password),
            'department' => $email->department,
            'person_used' => $email->person_used,
            'purpose' => $email->purpose,
            'recovery_email' => $email->recovery_email,
            'recovery_number_verification' => $email->recovery_number_verification,
            'updated_by' => $email->updated_by,
            'created_at' => optional($email->created_at)->toDateTimeString(),
            'updated_at' => optional($email->updated_at)->toDateTimeString(),
            'custom_fields' => app(DynamicTableValueService::class)->values('emails', $email->id),
        ];
    }

    private function buildPdfExport(): string
    {
        $lines = ['Email Management Export', 'Generated: '.now()->toDateTimeString(), implode(' | ', self::EXPORT_HEADERS), ''];

        Email::query()->latest('updated_at')->limit(120)->get()->each(function (Email $email) use (&$lines) {
            $lines[] = implode(' | ', [
                $email->emails_type,
                $email->email_account,
                $email->password ? '********' : '',
                $email->department,
                $email->person_used,
                $email->purpose,
                $email->recovery_email,
                $email->recovery_number_verification,
            ]);
        });

        if (count($lines) === 4) {
            $lines[] = 'No email records found.';
        }

        $content = "BT\n/F1 8 Tf\n36 790 Td\n";
        foreach ($lines as $index => $line) {
            if ($index > 0) {
                $content .= "0 -12 Td\n";
            }
            $content .= '('.$this->escapePdfText(substr($line, 0, 140)).") Tj\n";
        }
        $content .= "ET";

        $objects = [
            "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
            "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
            "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
            "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
            "5 0 obj\n<< /Length ".strlen($content)." >>\nstream\n{$content}\nendstream\nendobj\n",
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $object) {
            $offsets[] = strlen($pdf);
            $pdf .= $object;
        }

        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n";
        $pdf .= "0000000000 65535 f \n";

        for ($i = 1; $i <= count($objects); $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }

        $pdf .= "trailer\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\n";
        $pdf .= "startxref\n{$xrefOffset}\n%%EOF";

        return $pdf;
    }

    private function escapePdfText(string $value): string
    {
        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $value);
    }

    private function normalizeHeader(string $value): string
    {
        $value = preg_replace('/^\xEF\xBB\xBF/', '', $value) ?? $value;

        return preg_replace('/\s+/', ' ', strtoupper(trim($value))) ?? '';
    }

    private function uniqueOptions(string $column): array
    {
        return Email::query()
            ->whereNotNull($column)
            ->where($column, '<>', '')
            ->distinct()
            ->orderBy($column)
            ->pluck($column)
            ->map(fn ($value) => trim((string) $value))
            ->filter()
            ->values()
            ->all();
    }
}
