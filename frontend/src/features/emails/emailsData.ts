import { emailsApi } from '../../services/api/emailsApi'
import type { EmailAccountFormValues } from './emailsSchema'

export type EmailAccountRecord = EmailAccountFormValues & {
  id: string
  hasPassword: boolean
  updatedBy: string
  createdAt: string
  updatedAt: string
  customFields?: Record<string, unknown>
}

export type EmailOptions = {
  emailsTypes: string[]
  departments: string[]
}

type ApiEmailRecord = {
  id?: number | string
  emails_type?: string | null
  email_account?: string | null
  password?: string | null
  has_password?: boolean | null
  recovery_email?: string | null
  department?: string | null
  person_used?: string | null
  purpose?: string | null
  recovery_number_verification?: string | null
  updated_by?: string | null
  created_at?: string | null
  updated_at?: string | null
  custom_fields?: Record<string, unknown> | null
}

function normalizeEmailRecord(record: ApiEmailRecord): EmailAccountRecord {
  return {
    ...getDefaultEmailAccountFormValues(),
    id: String(record.id ?? ''),
    emailsType: record.emails_type ?? '',
    emailAccount: record.email_account ?? '',
    password: record.password ?? '',
    hasPassword: Boolean(record.has_password ?? record.password),
    recoveryEmail: record.recovery_email ?? '',
    department: record.department ?? '',
    personUsed: record.person_used ?? '',
    purpose: record.purpose ?? '',
    recoveryNumberVerification: record.recovery_number_verification ?? '',
    updatedBy: record.updated_by ?? '',
    createdAt: record.created_at ?? '',
    updatedAt: record.updated_at ?? '',
    customFields: record.custom_fields ?? {},
  }
}

function toEmailPayload(values: EmailAccountFormValues) {
  const payload: Record<string, string> = {
    emails_type: values.emailsType,
    email_account: values.emailAccount,
    recovery_email: values.recoveryEmail ?? '',
    department: values.department ?? '',
    person_used: values.personUsed ?? '',
    purpose: values.purpose ?? '',
    recovery_number_verification: values.recoveryNumberVerification ?? '',
  }

  if (values.password !== undefined) {
    payload.password = values.password
  }

  return payload
}

export async function fetchEmailRows(filters: {
  search?: string
  emailsType?: string
  department?: string
} = {}): Promise<EmailAccountRecord[]> {
  const params = Object.fromEntries(Object.entries({
    search: filters.search,
    emails_type: filters.emailsType,
    department: filters.department,
  }).filter(([, value]) => value && value !== 'all'))
  const response = await emailsApi.list(params)
  const records = Array.isArray(response.data) ? response.data : response.data?.data ?? []

  return records.map((record: ApiEmailRecord) => normalizeEmailRecord(record))
}

export async function fetchEmailOptions(): Promise<EmailOptions> {
  const response = await emailsApi.options()

  return {
    emailsTypes: response.data?.emails_types ?? [],
    departments: response.data?.departments ?? [],
  }
}

export async function fetchEmailRecord(
  id: string,
  options: { withSecret?: boolean } = {},
): Promise<EmailAccountRecord> {
  const response = await emailsApi.detail(id, { with_secret: options.withSecret ? 1 : 0 })

  return normalizeEmailRecord(response.data?.data ?? response.data)
}

export async function createEmailRecord(values: EmailAccountFormValues): Promise<EmailAccountRecord> {
  const response = await emailsApi.create(toEmailPayload(values))

  return normalizeEmailRecord(response.data?.data ?? response.data)
}

export async function updateEmailRecord(
  id: string,
  values: EmailAccountFormValues,
): Promise<EmailAccountRecord> {
  const response = await emailsApi.update(id, toEmailPayload(values))

  return normalizeEmailRecord(response.data?.data ?? response.data)
}

export async function deleteEmailRecord(id: string): Promise<void> {
  await emailsApi.remove(id)
}

export type EmailImportError = {
  row: number
  email?: string
  column?: string
  reason?: string
  errors: string[]
}

export type EmailImportSummary = {
  total_rows: number
  imported_rows: number
  skipped_rows: number
  failed_rows: number
  validation_errors: EmailImportError[]
  message?: string
}

export async function importEmailRecords(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<EmailImportSummary> {
  const response = await emailsApi.import(file, onProgress)

  return response.data
}

export async function exportEmailRecords(format: 'csv' | 'excel' | 'pdf' = 'csv') {
  const response = await emailsApi.export(format)
  const disposition = response.headers['content-disposition'] ?? ''
  const filename = disposition.match(/filename="([^"]+)"/)?.[1] ?? `emails.${format === 'pdf' ? 'pdf' : 'csv'}`
  const url = window.URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}

export function getDefaultEmailAccountFormValues(): EmailAccountFormValues {
  return {
    emailsType: '',
    emailAccount: '',
    password: '',
    recoveryEmail: '',
    department: '',
    personUsed: '',
    purpose: '',
    recoveryNumberVerification: '',
  }
}
