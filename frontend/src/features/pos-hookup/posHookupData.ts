import type { PosHookupFormValues } from './posHookupSchema'
import { posHookupsApi } from '../../services/api/posHookupsApi'

export type PosHookupRecord = PosHookupFormValues & {
  id: string
  updatedBy: string
  lastUpdated: string
  duplicateIp?: boolean
  missingFields?: string[]
  logs: Array<{
    actor: string
    detail: string
    timestamp: string
  }>
  customFields?: Record<string, unknown>
}

export const posBranchOptions = [
  'Head Office',
  'Avada Center',
  'Avada Boutique',
  'Store Internet Provider',
  'North Mall Kiosk',
]

export const mallServerOptions = [
  '10.10.40.12',
  '10.10.50.12',
  '172.16.12.8',
  '192.168.100.20',
]

export const posHookupRows: PosHookupRecord[] = [
  {
    id: 'pos-001',
    branch: 'Head Office',
    contractNumber: 'CN-AVD-2026-001',
    code: 'HO-POS-01',
    ipAddress: '192.168.40.21',
    subnetMask: '255.255.255.0',
    gateway: '192.168.40.1',
    mallServerIp: '10.10.40.12',
    ssidUsername: 'AIMS-POS-HO',
    password: 'Encrypted@POS01',
    salesPath: '\\\\aims-pos\\sales\\head-office',
    status: 'Active',
    notes: 'Primary POS terminal for head office validation.',
    updatedBy: 'Ron Villanueva',
    lastUpdated: 'Today 10:18',
    logs: [
      {
        actor: 'Ron Villanueva',
        detail: 'Validated gateway and mall server route.',
        timestamp: 'Today 10:18',
      },
    ],
  },
  {
    id: 'pos-002',
    branch: 'Avada Center',
    contractNumber: 'CN-AVD-2026-018',
    code: 'AC-POS-02',
    ipAddress: '192.168.50.32',
    subnetMask: '255.255.255.0',
    gateway: '192.168.50.1',
    mallServerIp: '10.10.50.12',
    ssidUsername: 'Avada Center 5G',
    password: 'Encrypted@Center02',
    salesPath: '\\\\mall-server\\avada-center\\sales',
    status: 'Active',
    notes: 'Connected through store WiFi with dedicated sales share.',
    updatedBy: 'Michaela Santos',
    lastUpdated: 'Today 08:44',
    logs: [
      {
        actor: 'Michaela Santos',
        detail: 'Updated sales path after mall server migration.',
        timestamp: 'Today 08:44',
      },
    ],
  },
  {
    id: 'pos-003',
    branch: 'Avada Boutique',
    contractNumber: 'CN-AVD-2025-114',
    code: 'BTQ-POS-01',
    ipAddress: '192.168.60.44',
    subnetMask: '255.255.255.0',
    gateway: '192.168.60.1',
    mallServerIp: '172.16.12.8',
    ssidUsername: 'Boutique Staff',
    password: 'Encrypted@Btq01',
    salesPath: '',
    status: 'Missing Details',
    notes: 'Sales path pending from mall IT.',
    updatedBy: 'Service Desk',
    lastUpdated: 'Yesterday 16:02',
    missingFields: ['Sales Path'],
    logs: [
      {
        actor: 'Service Desk',
        detail: 'Marked missing sales path; requested mall IT confirmation.',
        timestamp: 'Yesterday 16:02',
      },
    ],
  },
  {
    id: 'pos-004',
    branch: 'Store Internet Provider',
    contractNumber: 'CN-AVD-2025-210',
    code: 'SIP-POS-03',
    ipAddress: '192.168.50.32',
    subnetMask: '255.255.255.0',
    gateway: '192.168.70.1',
    mallServerIp: '192.168.100.20',
    ssidUsername: 'Store Staff WiFi',
    password: 'Encrypted@Store03',
    salesPath: '\\\\store-nas\\sales\\sip-pos-03',
    status: 'For Checking',
    notes: 'Duplicate IP detected against Avada Center POS.',
    updatedBy: 'Network Admin',
    lastUpdated: 'May 14, 2026',
    duplicateIp: true,
    logs: [
      {
        actor: 'Network Admin',
        detail: 'Duplicate IP flagged during POS audit.',
        timestamp: 'May 14, 2026 14:12',
      },
    ],
  },
  {
    id: 'pos-005',
    branch: 'North Mall Kiosk',
    contractNumber: 'CN-AVD-2024-092',
    code: 'NMK-POS-01',
    ipAddress: '192.168.80.17',
    subnetMask: '255.255.255.0',
    gateway: '192.168.80.1',
    mallServerIp: '10.10.50.12',
    ssidUsername: '',
    password: 'Encrypted@Kiosk01',
    salesPath: '\\\\mall-server\\north-mall\\sales',
    status: 'Offline',
    notes: 'SSID credential missing after router replacement.',
    updatedBy: 'Store Supervisor',
    lastUpdated: 'May 12, 2026',
    missingFields: ['SSID / Username'],
    logs: [
      {
        actor: 'Store Supervisor',
        detail: 'Reported POS offline after router replacement.',
        timestamp: 'May 12, 2026 09:28',
      },
    ],
  },
]

export async function fetchPosHookupRows(): Promise<PosHookupRecord[]> {
  const response = await posHookupsApi.list()
  const rows = Array.isArray(response.data) ? response.data : response.data?.data ?? []

  return rows as PosHookupRecord[]
}

export function getDefaultPosHookupFormValues(): PosHookupFormValues {
  return {
    branch: 'Head Office',
    contractNumber: '',
    code: '',
    ipAddress: '',
    subnetMask: '255.255.255.0',
    gateway: '',
    mallServerIp: '10.10.40.12',
    ssidUsername: '',
    password: '',
    salesPath: '',
    status: 'Active',
    notes: '',
  }
}
