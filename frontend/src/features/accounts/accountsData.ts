import type { AccountFormValues } from './accountsSchema'
import { accountsApi } from '../../services/api/accountsApi'

export type AccountRecord = AccountFormValues & {
  id: string
  updatedBy: string
  lastUpdated: string
  duplicateAccountNumber?: boolean
  invalidUrl?: boolean
  missingLink?: boolean
  missingFields?: string[]
  logs: Array<{
    actor: string
    detail: string
    timestamp: string
  }>
  customFields?: Record<string, unknown>
}

export const bankOptions = ['BDO', 'BPI', 'Metrobank', 'Security Bank', 'UnionBank']

export const companyOptions = ['Avada Trading Corp.', 'Avada Boutique Inc.', 'PLDT']

export const linkDepartmentOptions = [
  'IT',
  'Marketing',
  'E-Commerce',
  'Operations',
  'Finance',
  'POS',
]

export const accountBranchOptions = [
  'Head Office',
  'Avada Center',
  'Avada Boutique',
  'Store Internet Provider',
  'North Mall Boutique',
]

type ApiAccountRecord = Partial<AccountFormValues> & {
  id?: number | string
  account_type?: AccountRecord['accountType']
  merchant_name?: string | null
  store_location_name?: string | null
  store_address?: string | null
  store_manager?: string | null
  store_email?: string | null
  store_contact_number?: string | null
  account_name?: string | null
  account_number?: string | null
  pldt_status?: string | null
  company_account?: string | null
  updated_by?: string | null
  updatedBy?: string | null
  last_updated?: string | null
  lastUpdated?: string | null
  duplicate_account_number?: boolean | null
  duplicateAccountNumber?: boolean | null
  invalid_url?: boolean | null
  invalidUrl?: boolean | null
  missing_link?: boolean | null
  missingLink?: boolean | null
  missing_fields?: string[] | null
  missingFields?: string[] | null
  logs?: AccountRecord['logs'] | null
  custom_fields?: Record<string, unknown> | null
  updated_at?: string | null
}

function normalizeAccountRecord(record: ApiAccountRecord): AccountRecord {
  return {
    ...getDefaultAccountFormValues(),
    id: String(record.id ?? ''),
    accountType: record.accountType ?? record.account_type ?? 'Store Account',
    merchantName: record.merchantName ?? record.merchant_name ?? '',
    storeLocationName: record.storeLocationName ?? record.store_location_name ?? '',
    storeAddress: record.storeAddress ?? record.store_address ?? '',
    storeManager: record.storeManager ?? record.store_manager ?? '',
    storeEmail: record.storeEmail ?? record.store_email ?? '',
    storeContactNumber: record.storeContactNumber ?? record.store_contact_number ?? '',
    bank: record.bank ?? '',
    accountName: record.accountName ?? record.account_name ?? '',
    accountNumber: record.accountNumber ?? record.account_number ?? '',
    company: record.company ?? '',
    branch: record.branch ?? '',
    pldtStatus: record.pldtStatus ?? record.pldt_status ?? '',
    remarks: record.remarks ?? '',
    check: record.check ?? '',
    companyAccount: record.companyAccount ?? record.company_account ?? '',
    department: record.department ?? '',
    email: record.email ?? '',
    username: record.username ?? '',
    password: record.password ?? '',
    link: record.link ?? '',
    status: record.status ?? 'Active',
    notes: record.notes ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    lastUpdated: record.lastUpdated ?? record.last_updated ?? record.updated_at ?? '',
    duplicateAccountNumber: Boolean(record.duplicateAccountNumber ?? record.duplicate_account_number),
    invalidUrl: Boolean(record.invalidUrl ?? record.invalid_url),
    missingLink: Boolean(record.missingLink ?? record.missing_link),
    missingFields: record.missingFields ?? record.missing_fields ?? [],
    logs: record.logs ?? [],
    customFields: record.custom_fields ?? {},
  }
}

function toAccountPayload(values: AccountFormValues) {
  return {
    account_type: values.accountType,
    merchant_name: values.merchantName ?? '',
    store_location_name: values.storeLocationName ?? '',
    store_address: values.storeAddress ?? '',
    store_manager: values.storeManager ?? '',
    store_email: values.storeEmail ?? '',
    store_contact_number: values.storeContactNumber ?? '',
    bank: values.bank ?? '',
    account_name: values.accountName ?? '',
    account_number: values.accountNumber ?? '',
    company: values.company ?? '',
    branch: values.branch ?? '',
    pldt_status: values.pldtStatus ?? '',
    remarks: values.remarks ?? '',
    check: values.check ?? '',
    company_account: values.companyAccount ?? '',
    department: values.department ?? '',
    email: values.email ?? '',
    username: values.username ?? '',
    password: values.password ?? '',
    link: values.link ?? '',
    status: values.status,
    notes: values.notes ?? '',
  }
}

export async function fetchAccountRows(): Promise<AccountRecord[]> {
  const response = await accountsApi.list()
  const records = Array.isArray(response.data) ? response.data : response.data?.data ?? []

  return records.map((record: ApiAccountRecord) => normalizeAccountRecord(record))
}

export async function createAccountRecord(values: AccountFormValues): Promise<AccountRecord> {
  const response = await accountsApi.create(toAccountPayload(values))

  return normalizeAccountRecord(response.data?.data ?? response.data)
}

export async function updateAccountRecord(
  id: string,
  values: AccountFormValues,
): Promise<AccountRecord> {
  const response = await accountsApi.update(id, toAccountPayload(values))

  return normalizeAccountRecord(response.data?.data ?? response.data)
}

export async function deleteAccountRecord(id: string): Promise<void> {
  await accountsApi.remove(id)
}

export function getDefaultAccountFormValues(): AccountFormValues {
  return {
    accountType: 'Store Account',
    merchantName: '',
    storeLocationName: '',
    storeAddress: '',
    storeManager: '',
    storeEmail: '',
    storeContactNumber: '',
    bank: 'BDO',
    accountName: '',
    accountNumber: '',
    company: 'Avada Trading Corp.',
    branch: 'Head Office',
    pldtStatus: '',
    remarks: '',
    check: '',
    companyAccount: '',
    department: 'IT',
    email: '',
    username: '',
    password: '',
    link: '',
    status: 'Active',
    notes: '',
  }
}
