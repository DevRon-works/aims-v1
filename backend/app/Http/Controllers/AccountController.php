<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Services\DynamicTableValueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Account::query()->latest('updated_at');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search) {
                foreach ([
                    'account_type',
                    'merchant_name',
                    'store_location_name',
                    'bank',
                    'account_name',
                    'account_number',
                    'company',
                    'branch',
                    'department',
                    'email',
                    'username',
                    'link',
                    'notes',
                ] as $column) {
                    $builder->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

        return response()->json([
            'data' => $query->get()->map(fn (Account $account) => $this->toResource($account))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $account = Account::query()->create($this->validatedData($request));

        return response()->json(['data' => $this->toResource($account)], 201);
    }

    public function show(Account $account): JsonResponse
    {
        return response()->json(['data' => $this->toResource($account)]);
    }

    public function update(Request $request, Account $account): JsonResponse
    {
        $account->update($this->validatedData($request));

        return response()->json(['data' => $this->toResource($account->refresh())]);
    }

    public function destroy(Account $account): JsonResponse
    {
        $account->delete();

        return response()->json(null, 204);
    }

    private function validatedData(Request $request): array
    {
        $validated = $request->validate([
            'account_type' => ['required', 'string', 'in:Store Account,PLDT Internet,Link Account'],
            'merchant_name' => ['nullable', 'string', 'max:255'],
            'store_location_name' => ['nullable', 'string', 'max:255'],
            'store_address' => ['nullable', 'string'],
            'store_manager' => ['nullable', 'string', 'max:255'],
            'store_email' => ['nullable', 'email', 'max:255'],
            'store_contact_number' => ['nullable', 'string', 'max:30'],
            'bank' => ['nullable', 'string', 'max:255'],
            'account_name' => ['nullable', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'branch' => ['nullable', 'string', 'max:255'],
            'pldt_status' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string'],
            'check' => ['nullable', 'string', 'max:255'],
            'company_account' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],
            'link' => ['nullable', 'url', 'max:2048'],
            'status' => ['required', 'string', 'in:Active,Inactive,Expired,For Checking,Disabled,Missing Details,Closed,Updated'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['updated_by'] = $request->user()?->name;
        $validated['missing_link'] = ($validated['account_type'] ?? '') === 'Link Account' && empty($validated['link']);
        $validated['invalid_url'] = false;
        $validated['missing_fields'] = $this->missingFields($validated);

        return $validated;
    }

    private function missingFields(array $account): array
    {
        $missing = [];

        if (($account['account_type'] ?? '') === 'Link Account') {
            foreach (['link' => 'Link', 'email' => 'Email', 'username' => 'Username'] as $field => $label) {
                if (empty($account[$field])) {
                    $missing[] = $label;
                }
            }

            return $missing;
        }

        foreach (['account_number' => 'Account Number'] as $field => $label) {
            if (empty($account[$field])) {
                $missing[] = $label;
            }
        }

        return $missing;
    }

    private function toResource(Account $account): array
    {
        return [
            'id' => $account->id,
            'account_type' => $account->account_type,
            'merchant_name' => $account->merchant_name,
            'store_location_name' => $account->store_location_name,
            'store_address' => $account->store_address,
            'store_manager' => $account->store_manager,
            'store_email' => $account->store_email,
            'store_contact_number' => $account->store_contact_number,
            'bank' => $account->bank,
            'account_name' => $account->account_name,
            'account_number' => $account->account_number,
            'company' => $account->company,
            'branch' => $account->branch,
            'pldt_status' => $account->pldt_status,
            'remarks' => $account->remarks,
            'check' => $account->check,
            'company_account' => $account->company_account,
            'department' => $account->department,
            'email' => $account->email,
            'username' => $account->username,
            'password' => $account->password,
            'link' => $account->link,
            'status' => $account->status,
            'notes' => $account->notes,
            'updated_by' => $account->updated_by,
            'last_updated' => optional($account->updated_at)->toDateTimeString(),
            'duplicate_account_number' => $account->duplicate_account_number,
            'invalid_url' => $account->invalid_url,
            'missing_link' => $account->missing_link,
            'missing_fields' => $account->missing_fields ?? [],
            'logs' => $account->logs ?? [],
            'custom_fields' => app(DynamicTableValueService::class)->values(
                match ($account->account_type) {
                    'PLDT Internet' => 'accounts-pldt',
                    'Link Account' => 'accounts-links',
                    default => 'accounts-store',
                },
                $account->id,
            ),
        ];
    }
}
