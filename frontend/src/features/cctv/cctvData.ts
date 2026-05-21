import { cctvApi } from '../../services/api/cctvApi'
import type { CctvFormValues } from './cctvSchema'

export type CctvSection = 'Avada Center' | 'Boutique' | 'Warehouse / Online'

export type CctvRecord = CctvFormValues & {
  id: string
  type: CctvSection
  lastUpdated: string
  updatedBy: string
  logs: Array<{
    actor: string
    detail: string
    timestamp: string
  }>
  customFields?: Record<string, unknown>
}

export type CctvPaginationMeta = {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  from: number | null
  to: number | null
}

export type CctvListResponse = {
  data: CctvRecord[]
  meta: CctvPaginationMeta
}

export type CctvImportSummary = {
  cctv_type?: CctvSection
  total_rows: number
  imported_rows: number
  skipped_duplicate_rows: number
  updated_rows: number
  failed_rows: number
  validation_errors: Array<{
    row: number
    column?: string
    reason?: string
    errors: string[]
  }>
  rolled_back?: boolean
  message?: string
}

export type CctvExportScope = 'current' | 'filtered' | 'all'
export type CctvExportFormat = 'xlsx' | 'csv'

type ApiCctvRecord = Partial<CctvFormValues> & {
  id?: number | string
  type?: CctvSection
  floor_name?: string | null
  camera_number?: string | null
  camera_name?: string | null
  working_cameras?: string | null
  nvr_ip?: string | null
  camera_ip?: string | null
  web_ip?: string | null
  updated_by?: string | null
  updatedBy?: string | null
  last_updated?: string | null
  lastUpdated?: string | null
  updated_at?: string | null
  logs?: CctvRecord['logs'] | null
  custom_fields?: Record<string, unknown> | null
}

type ApiPaginationMeta = {
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
  from?: number | null
  to?: number | null
}

const sectionEndpoints: Record<CctvSection, string> = {
  'Avada Center': '/cctv/avada-center',
  Boutique: '/cctv/boutique',
  'Warehouse / Online': '/cctv/warehouse-online',
}

export const cctvFloors = [
  'Ground Floor',
  'Second Floor',
  'Third Floor',
  'IT Room',
  'Receiving Bay',
]

export const cctvBranches = [
  'Avada Boutique - BGC',
  'Avada Boutique - Makati',
  'Avada Boutique - Cebu',
  'Avada Boutique - Davao',
  'Central Warehouse',
  'Online Fulfillment Hub',
  'Returns Processing',
]

export const cctvBrands = ['Hikvision', 'Dahua', 'Uniview', 'TP-Link VIGI', 'Axis', 'Reolink']

export function getCctvEndpoint(section: CctvSection) {
  return sectionEndpoints[section]
}

export async function fetchCctvRows({
  page,
  perPage,
  search,
  section,
}: {
  page: number
  perPage: number
  search: string
  section: CctvSection
}): Promise<CctvListResponse> {
  const response = await cctvApi.list(getCctvEndpoint(section), {
    page,
    per_page: perPage,
    search: search || undefined,
  })

  const records = Array.isArray(response.data) ? response.data : response.data?.data ?? []

  return {
    data: records.map((record: ApiCctvRecord) => normalizeCctvRecord(record, section)),
    meta: normalizePaginationMeta(response.data?.meta),
  }
}

export async function viewCctvRecord(
  section: CctvSection,
  id: string,
): Promise<CctvRecord> {
  const response = await cctvApi.detail(getCctvEndpoint(section), id)

  return normalizeCctvRecord(response.data?.data ?? response.data, section)
}

export async function createCctvRecord(
  section: CctvSection,
  values: CctvFormValues,
): Promise<CctvRecord> {
  const response = await cctvApi.create(getCctvEndpoint(section), toCctvPayload(section, values))

  return normalizeCctvRecord(response.data?.data ?? response.data, section)
}

export async function updateCctvRecord(
  section: CctvSection,
  id: string,
  values: CctvFormValues,
): Promise<CctvRecord> {
  const response = await cctvApi.update(getCctvEndpoint(section), id, toCctvPayload(section, values))

  return normalizeCctvRecord(response.data?.data ?? response.data, section)
}

export async function deleteCctvRecord(section: CctvSection, id: string): Promise<void> {
  await cctvApi.remove(getCctvEndpoint(section), id)
}

export async function importCctvRecords(
  section: CctvSection,
  file: File,
): Promise<CctvImportSummary> {
  const response = await cctvApi.import(section, file)

  return response.data
}

export async function exportCctvRecords({
  format,
  page,
  perPage,
  scope,
  search,
  section,
}: {
  format: CctvExportFormat
  page: number
  perPage: number
  scope: CctvExportScope
  search: string
  section: CctvSection
}): Promise<void> {
  const response = await cctvApi.export(getCctvEndpoint(section), {
    format,
    page,
    per_page: perPage,
    scope,
    search: scope === 'all' ? undefined : search || undefined,
  })

  const blob = new Blob([response.data])
  const disposition = response.headers['content-disposition'] ?? ''
  const filename = filenameFromDisposition(disposition) ?? fallbackExportFilename(section, format)
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

function normalizeCctvRecord(record: ApiCctvRecord, fallbackSection: CctvSection): CctvRecord {
  return {
    ...getDefaultCctvFormValues(fallbackSection),
    id: String(record.id ?? ''),
    type: record.type ?? fallbackSection,
    floorName: record.floorName ?? record.floor_name ?? '',
    cameraNumber: record.cameraNumber ?? record.camera_number ?? '',
    cameraName: record.cameraName ?? record.camera_name ?? '',
    branch: record.branch ?? '',
    brand: record.brand ?? '',
    workingCameras: record.workingCameras ?? record.working_cameras ?? '',
    model: record.model ?? '',
    serial: record.serial ?? '',
    username: record.username ?? '',
    password: record.password ?? '',
    nvrIp: record.nvrIp ?? record.nvr_ip ?? '',
    cameraIp: record.cameraIp ?? record.camera_ip ?? '',
    webIp: record.webIp ?? record.web_ip ?? '',
    storage: record.storage ?? '',
    status: record.status ?? 'Online',
    notes: record.notes ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    lastUpdated: record.lastUpdated ?? record.last_updated ?? record.updated_at ?? '',
    logs: record.logs ?? [],
    customFields: record.custom_fields ?? {},
  }
}

function normalizePaginationMeta(meta?: ApiPaginationMeta): CctvPaginationMeta {
  return {
    currentPage: meta?.current_page ?? 1,
    lastPage: meta?.last_page ?? 1,
    perPage: meta?.per_page ?? 5,
    total: meta?.total ?? 0,
    from: meta?.from ?? null,
    to: meta?.to ?? null,
  }
}

function toCctvPayload(section: CctvSection, values: CctvFormValues) {
  if (section === 'Avada Center') {
    return {
      floor_name: values.floorName ?? '',
      camera_number: values.cameraNumber ?? '',
      camera_name: values.cameraName ?? '',
      username: values.username ?? '',
      password: values.password ?? '',
      nvr_ip: values.nvrIp ?? '',
      camera_ip: values.cameraIp ?? '',
      status: values.status,
      notes: values.notes ?? '',
    }
  }

  if (section === 'Boutique') {
    return {
      branch: values.branch ?? '',
      brand: values.brand ?? '',
      working_cameras: values.workingCameras ?? '',
      serial: values.serial ?? '',
      username: values.username ?? '',
      password: values.password ?? '',
      web_ip: values.webIp ?? '',
      storage: values.storage ?? '',
      status: values.status,
      notes: values.notes ?? '',
    }
  }

  return {
    branch: values.branch ?? '',
    brand: values.brand ?? '',
    model: values.model ?? '',
    serial: values.serial ?? '',
    username: values.username ?? '',
    password: values.password ?? '',
    web_ip: values.webIp ?? '',
    storage: values.storage ?? '',
    status: values.status,
    notes: values.notes ?? '',
  }
}

export function getDefaultCctvFormValues(section: CctvSection = 'Avada Center'): CctvFormValues {
  return {
    type: section,
    floorName: section === 'Avada Center' ? 'Ground Floor' : '',
    cameraNumber: '',
    cameraName: '',
    branch: section === 'Avada Center' ? '' : '',
    brand: section === 'Avada Center' ? '' : 'Hikvision',
    workingCameras: '',
    model: '',
    serial: '',
    username: '',
    password: '',
    nvrIp: '',
    cameraIp: '',
    webIp: '',
    storage: '',
    status: 'Online',
    notes: '',
  }
}

function fallbackExportFilename(section: CctvSection, format: CctvExportFormat) {
  const slug = section.toLowerCase().replace(/\s*\/\s*/g, '-').replace(/\s+/g, '-')
  const today = new Date().toISOString().slice(0, 10)

  return `cctv-${slug}-${today}.${format}`
}

function filenameFromDisposition(disposition: string): string | null {
  const match = disposition.match(/filename="?([^"]+)"?/i)

  return match?.[1] ?? null
}
