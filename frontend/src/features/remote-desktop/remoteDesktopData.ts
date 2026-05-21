import type { RemoteDesktopFormValues } from './remoteDesktopSchema'
import { remoteDesktopsApi } from '../../services/api/remoteDesktopsApi'

export type RemoteDesktopRecord = RemoteDesktopFormValues & {
  id: string
  updatedBy: string
  lastUpdated: string
  duplicateIp?: boolean
  duplicateAnydesk?: boolean
  missingCredentials?: boolean
  logs: Array<{
    actor: string
    detail: string
    timestamp: string
  }>
  customFields?: Record<string, unknown>
}

export const remoteLocations = [
  'Head Office',
  'Finance Office',
  'IT Room',
  'Avada Center',
  'Avada Boutique',
  'North Mall Boutique',
]

export const remoteDepartments = [
  'IT',
  'Finance',
  'Operations',
  'Sales',
  'Inventory',
  'POS',
]

export const remoteDesktopRows: RemoteDesktopRecord[] = [
  {
    id: 'rd-001',
    type: 'Avada',
    location: 'Head Office',
    name: 'HO Admin Workstation',
    department: 'IT',
    ipAddress: '192.168.10.45',
    terminalNumber: '',
    computerName: 'AIMS-HO-ADMIN',
    branch: '',
    posDateUsed: '',
    anydeskId: '812 445 990',
    password: 'Encrypted@RD01',
    teamViewer: 'TV-192044',
    status: 'Active',
    notes: 'Primary IT support workstation.',
    updatedBy: 'Ron Villanueva',
    lastUpdated: 'Today 10:32',
    logs: [
      {
        actor: 'Ron Villanueva',
        detail: 'Validated AnyDesk unattended access.',
        timestamp: 'Today 10:32',
      },
    ],
  },
  {
    id: 'rd-002',
    type: 'Avada',
    location: 'Finance Office',
    name: 'Accounting PC 02',
    department: 'Finance',
    ipAddress: '192.168.10.58',
    terminalNumber: '',
    computerName: 'AIMS-FIN-02',
    branch: '',
    posDateUsed: '',
    anydeskId: '812 445 991',
    password: '',
    teamViewer: 'TV-192058',
    status: 'For Checking',
    notes: 'Password missing after workstation replacement.',
    updatedBy: 'Service Desk',
    lastUpdated: 'Today 08:18',
    missingCredentials: true,
    logs: [
      {
        actor: 'Service Desk',
        detail: 'Flagged missing unattended password.',
        timestamp: 'Today 08:18',
      },
    ],
  },
  {
    id: 'rd-003',
    type: 'Avada',
    location: 'Operations',
    name: 'Ops Monitoring PC',
    department: 'Operations',
    ipAddress: '192.168.10.45',
    terminalNumber: '',
    computerName: 'AIMS-OPS-MON',
    branch: '',
    posDateUsed: '',
    anydeskId: '812 445 992',
    password: 'Encrypted@OPS01',
    teamViewer: '',
    status: 'Maintenance',
    notes: 'Duplicate IP requires DHCP reservation cleanup.',
    updatedBy: 'Network Admin',
    lastUpdated: 'Yesterday 15:46',
    duplicateIp: true,
    logs: [
      {
        actor: 'Network Admin',
        detail: 'Duplicate IP detected during remote access audit.',
        timestamp: 'Yesterday 15:46',
      },
    ],
  },
  {
    id: 'rd-004',
    type: 'Boutique',
    location: '',
    name: '',
    department: 'POS',
    ipAddress: '192.168.50.71',
    terminalNumber: 'T-01',
    computerName: 'BTQ-POS-01',
    branch: 'Avada Boutique',
    posDateUsed: '2026-05-14',
    anydeskId: '901 221 114',
    password: 'Encrypted@BTQ01',
    teamViewer: 'TV-BTQ-001',
    status: 'Active',
    notes: 'Main cashier POS terminal.',
    updatedBy: 'Michaela Santos',
    lastUpdated: 'May 14, 2026',
    logs: [
      {
        actor: 'Michaela Santos',
        detail: 'Updated TeamViewer fallback ID.',
        timestamp: 'May 14, 2026 11:24',
      },
    ],
  },
  {
    id: 'rd-005',
    type: 'Boutique',
    location: '',
    name: '',
    department: 'POS',
    ipAddress: '192.168.50.72',
    terminalNumber: 'T-02',
    computerName: 'BTQ-POS-02',
    branch: 'Avada Boutique',
    posDateUsed: '2026-05-13',
    anydeskId: '901 221 114',
    password: 'Encrypted@BTQ02',
    teamViewer: '',
    status: 'No Access',
    notes: 'Duplicate AnyDesk ID needs verification.',
    updatedBy: 'Store Supervisor',
    lastUpdated: 'May 13, 2026',
    duplicateAnydesk: true,
    logs: [
      {
        actor: 'Store Supervisor',
        detail: 'Reported no remote access during POS support call.',
        timestamp: 'May 13, 2026 16:08',
      },
    ],
  },
  {
    id: 'rd-006',
    type: 'Boutique',
    location: '',
    name: '',
    department: 'POS',
    ipAddress: '192.168.80.21',
    terminalNumber: 'T-01',
    computerName: 'NMK-POS-01',
    branch: 'North Mall Boutique',
    posDateUsed: '2026-05-12',
    anydeskId: '730 888 201',
    password: '',
    teamViewer: 'TV-NMK-001',
    status: 'Offline',
    notes: 'Missing AnyDesk password; terminal offline after router issue.',
    updatedBy: 'Service Desk',
    lastUpdated: 'May 12, 2026',
    missingCredentials: true,
    logs: [
      {
        actor: 'Service Desk',
        detail: 'Tagged missing credentials and offline status.',
        timestamp: 'May 12, 2026 09:41',
      },
    ],
  },
]

export async function fetchRemoteDesktopRows(): Promise<RemoteDesktopRecord[]> {
  const response = await remoteDesktopsApi.list()
  const rows = Array.isArray(response.data) ? response.data : response.data?.data ?? []

  return rows as RemoteDesktopRecord[]
}

export function getDefaultRemoteDesktopFormValues(): RemoteDesktopFormValues {
  return {
    type: 'Avada',
    location: 'Head Office',
    name: '',
    department: 'IT',
    ipAddress: '',
    terminalNumber: '',
    computerName: '',
    branch: '',
    posDateUsed: '',
    anydeskId: '',
    password: '',
    teamViewer: '',
    status: 'Active',
    notes: '',
  }
}
