import type { IpAddressingFormValues } from './ipAddressingSchema'
import { ipAddressesApi } from '../../services/api/ipAddressesApi'

type DeviceType = IpAddressingFormValues['deviceType']

export type IpAddressingRecord = IpAddressingFormValues & {
  id: string
  updatedBy: string
  lastUpdated: string
  duplicateIp?: boolean
  duplicateMac?: boolean
  missingFields?: string[]
  logs: Array<{
    actor: string
    detail: string
    timestamp: string
  }>
  customFields?: Record<string, unknown>
}

export type IpConnectionTestResult = {
  ipAddress: string
  online: boolean
  status: 'online' | 'offline'
  averageLatencyMs: number | null
  packetLossPercent: number | null
  output: string
}

export const ipLocationOptions = [
  'Head Office',
  'Finance Office',
  'Avada Center',
  'Avada Boutique',
  'North Mall Boutique',
  'CCTV Cabinet',
]

export const ipDepartmentOptions = [
  'IT',
  'Finance',
  'Operations',
  'Sales',
  'Inventory',
  'Security',
  'POS',
]

type ApiIpAddressRecord = {
  id?: number | string
  location?: string | null
  name?: string | null
  department?: string | null
  device_type?: DeviceType | null
  deviceType?: DeviceType | null
  device_name?: string | null
  deviceName?: string | null
  computer_name?: string | null
  computerName?: string | null
  mac_address?: string | null
  macAddress?: string | null
  ip_address?: string | null
  ipAddress?: string | null
  status?: IpAddressingRecord['status'] | null
  notes?: string | null
  updated_by?: string | null
  updatedBy?: string | null
  last_updated?: string | null
  lastUpdated?: string | null
  duplicate_ip?: boolean | null
  duplicateIp?: boolean | null
  duplicate_mac?: boolean | null
  duplicateMac?: boolean | null
  missing_fields?: string[] | null
  missingFields?: string[] | null
  logs?: IpAddressingRecord['logs'] | null
  updated_at?: string | null
  custom_fields?: Record<string, unknown> | null
}

type ApiIpConnectionTestResult = {
  ip_address?: string
  online?: boolean
  status?: 'online' | 'offline'
  average_latency_ms?: number | null
  packet_loss_percent?: number | null
  output?: string
}

function normalizeIpAddressingRecord(record: ApiIpAddressRecord): IpAddressingRecord {
  return {
    id: String(record.id ?? ''),
    deviceType: record.deviceType ?? record.device_type ?? 'desktop',
    location: record.location ?? '',
    name: record.name ?? '',
    department: record.department ?? '',
    deviceName:
      record.deviceName ??
      record.device_name ??
      record.computerName ??
      record.computer_name ??
      '',
    macAddress: record.macAddress ?? record.mac_address ?? '',
    ipAddress: record.ipAddress ?? record.ip_address ?? '',
    status: record.status ?? 'Active',
    notes: record.notes ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    lastUpdated: record.lastUpdated ?? record.last_updated ?? record.updated_at ?? '',
    duplicateIp: Boolean(record.duplicateIp ?? record.duplicate_ip),
    duplicateMac: Boolean(record.duplicateMac ?? record.duplicate_mac),
    missingFields: record.missingFields ?? record.missing_fields ?? [],
    logs: record.logs ?? [],
    customFields: record.custom_fields ?? {},
  }
}

function toIpAddressingPayload(values: IpAddressingFormValues) {
  return {
    device_type: values.deviceType,
    location: values.location,
    name: values.name,
    department: values.department,
    device_name: values.deviceName,
    mac_address: values.macAddress,
    ip_address: values.ipAddress,
    status: values.status,
    notes: values.notes ?? '',
  }
}

export async function fetchIpAddressingRows(): Promise<IpAddressingRecord[]> {
  const response = await ipAddressesApi.list()
  const records = Array.isArray(response.data) ? response.data : []

  return records.map((record) => normalizeIpAddressingRecord(record))
}

export async function createIpAddressingRecord(
  values: IpAddressingFormValues,
): Promise<IpAddressingRecord> {
  const response = await ipAddressesApi.create(toIpAddressingPayload(values))

  return normalizeIpAddressingRecord(response.data)
}

export async function updateIpAddressingRecord(
  id: string,
  values: IpAddressingFormValues,
): Promise<IpAddressingRecord> {
  const response = await ipAddressesApi.update(id, toIpAddressingPayload(values))

  return normalizeIpAddressingRecord(response.data)
}

export async function deleteIpAddressingRecord(id: string): Promise<void> {
  await ipAddressesApi.remove(id)
}

export async function testIpAddressConnection(
  id: string,
): Promise<IpConnectionTestResult> {
  const response = await ipAddressesApi.testConnection(id)
  const result = response.data as ApiIpConnectionTestResult

  return {
    ipAddress: result.ip_address ?? '',
    online: Boolean(result.online),
    status: result.status ?? 'offline',
    averageLatencyMs: result.average_latency_ms ?? null,
    packetLossPercent: result.packet_loss_percent ?? null,
    output: result.output ?? '',
  }
}

export function getDefaultIpAddressingFormValues(): IpAddressingFormValues {
  return {
    deviceType: 'desktop',
    location: 'Head Office',
    name: '',
    department: 'IT',
    deviceName: '',
    macAddress: '',
    ipAddress: '',
    status: 'Active',
    notes: '',
  }
}
