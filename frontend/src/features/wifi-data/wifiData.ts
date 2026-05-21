import type { WifiDataFormValues } from './wifiDataSchema'
import { wifiDataApi } from '../../services/api/wifiDataApi'

export type WifiDataRecord = WifiDataFormValues & {
  id: string
  updatedBy: string
  lastUpdated: string
  duplicateIp?: boolean
  duplicateSsid?: boolean
  publicIpCount: number
  logs: Array<{
    actor: string
    detail: string
    timestamp: string
  }>
  customFields?: Record<string, unknown>
}

export const wifiDataRows: WifiDataRecord[] = [
  {
    id: 'wifi-001',
    location: 'Head Office',
    areaFloor: 'Network Room / 4F',
    ispProvider: 'PLDT',
    routerBrand: 'Cisco',
    routerModel: 'ISR 1100',
    portalUsername: 'ho-admin',
    portalPassword: 'Encrypted@PLDT01',
    ssidName: 'Avada Center 5G',
    wifiPassword: 'AimsSecure@2026',
    wanIp: '203.177.12.18',
    gatewayIp: '192.168.10.1',
    lanIp: '192.168.10.10',
    deviceIp: '192.168.10.2',
    macAddress: 'AC:23:3F:91:42:10',
    simNumber: '',
    notes: 'Primary office fiber circuit. QR access enabled for IT staff.',
    status: 'Active',
    deviceType: 'ISP Modem',
    connectionType: 'Fiber',
    updatedBy: 'Ron Villanueva',
    lastUpdated: 'Today 09:42',
    publicIpCount: 2,
    logs: [
      {
        actor: 'Ron Villanueva',
        detail: 'Updated WAN IP after ISP maintenance window.',
        timestamp: 'Today 09:42',
      },
      {
        actor: 'Network Admin',
        detail: 'Generated WiFi QR code for Avada Center 5G.',
        timestamp: 'Yesterday 16:18',
      },
    ],
  },
  {
    id: 'wifi-002',
    location: 'Head Office',
    areaFloor: 'Operations / 3F',
    ispProvider: 'Converge',
    routerBrand: 'TP-Link',
    routerModel: 'ER605',
    portalUsername: 'ops-router',
    portalPassword: 'Encrypted@CNVRG01',
    ssidName: 'Avada Center 2.4G',
    wifiPassword: 'AimsOps@2026',
    wanIp: '120.28.41.88',
    gatewayIp: '192.168.20.1',
    lanIp: '192.168.20.10',
    deviceIp: '192.168.20.2',
    macAddress: 'D8:47:32:81:19:AC',
    simNumber: '',
    notes: 'Secondary ISP for failover and guest operations VLAN.',
    status: 'Active',
    deviceType: 'Third Party Router',
    connectionType: 'Fiber',
    updatedBy: 'Michaela Santos',
    lastUpdated: 'Today 08:31',
    publicIpCount: 1,
    logs: [
      {
        actor: 'Michaela Santos',
        detail: 'Confirmed failover route and updated portal credentials.',
        timestamp: 'Today 08:31',
      },
    ],
  },
  {
    id: 'wifi-003',
    location: 'Avada Center Branch',
    areaFloor: 'Sales Floor',
    ispProvider: 'Openline',
    routerBrand: 'Huawei',
    routerModel: 'B818',
    portalUsername: 'portable-admin',
    portalPassword: 'Encrypted@LTE01',
    ssidName: 'Michaela WiFi',
    wifiPassword: 'Portable@2026',
    wanIp: '10.80.14.22',
    gatewayIp: '192.168.50.1',
    lanIp: '192.168.50.10',
    deviceIp: '192.168.50.2',
    macAddress: '80:2A:A8:4D:18:77',
    simNumber: '0917-000-1842',
    notes: 'Portable modem used during fiber downtime. Monitor data cap.',
    status: 'Slow Connection',
    deviceType: 'Portable WiFi',
    connectionType: 'LTE',
    updatedBy: 'Service Desk',
    lastUpdated: 'Yesterday 17:05',
    duplicateSsid: true,
    publicIpCount: 0,
    logs: [
      {
        actor: 'Service Desk',
        detail: 'Marked slow connection after branch reported POS latency.',
        timestamp: 'Yesterday 17:05',
      },
    ],
  },
  {
    id: 'wifi-004',
    location: 'Store Internet Provider',
    areaFloor: 'Back Office',
    ispProvider: 'PLDT',
    routerBrand: 'Ubiquiti',
    routerModel: 'UniFi Dream Router',
    portalUsername: 'store-admin',
    portalPassword: 'Encrypted@Store02',
    ssidName: 'Store Staff WiFi',
    wifiPassword: 'StoreStaff@2026',
    wanIp: '203.177.12.18',
    gatewayIp: '192.168.60.1',
    lanIp: '192.168.60.10',
    deviceIp: '192.168.60.2',
    macAddress: '74:AC:B9:02:19:DD',
    simNumber: '',
    notes: 'Duplicate WAN IP requires verification with ISP.',
    status: 'Offline',
    deviceType: 'Office Router',
    connectionType: 'DSL',
    updatedBy: 'Network Admin',
    lastUpdated: 'May 14, 2026',
    duplicateIp: true,
    publicIpCount: 1,
    logs: [
      {
        actor: 'Network Admin',
        detail: 'Offline router highlighted for on-site inspection.',
        timestamp: 'May 14, 2026 15:22',
      },
    ],
  },
  {
    id: 'wifi-005',
    location: 'Head Office Internet Provider',
    areaFloor: 'CCTV Cabinet',
    ispProvider: 'Converge',
    routerBrand: 'MikroTik',
    routerModel: 'hEX S',
    portalUsername: 'cctv-net',
    portalPassword: 'Encrypted@CCTV01',
    ssidName: 'CCTV Network',
    wifiPassword: 'CctvOnly@2026',
    wanIp: '120.28.41.92',
    gatewayIp: '192.168.70.1',
    lanIp: '192.168.70.10',
    deviceIp: '192.168.70.2',
    macAddress: '48:A9:8A:12:FE:01',
    simNumber: '',
    notes: 'Isolated CCTV network. Password access restricted to admins.',
    status: 'Maintenance',
    deviceType: 'CCTV Network',
    connectionType: 'Wireless Bridge',
    updatedBy: 'Security Ops',
    lastUpdated: 'May 13, 2026',
    publicIpCount: 1,
    logs: [
      {
        actor: 'Security Ops',
        detail: 'Maintenance mode enabled for camera firmware checks.',
        timestamp: 'May 13, 2026 11:08',
      },
    ],
  },
  {
    id: 'wifi-006',
    location: 'Avada Center Branch',
    areaFloor: 'Cashier Area',
    ispProvider: 'Openline',
    routerBrand: 'ZTE',
    routerModel: 'MU5001',
    portalUsername: 'cashier-5g',
    portalPassword: 'Encrypted@5G01',
    ssidName: 'Michaela WiFi',
    wifiPassword: 'Cashier5G@2026',
    wanIp: '10.100.18.33',
    gatewayIp: '192.168.90.1',
    lanIp: '192.168.90.10',
    deviceIp: '192.168.90.2',
    macAddress: '9C:2F:9D:01:72:44',
    simNumber: '0998-412-7001',
    notes: '5G portable backup for POS continuity.',
    status: 'Disconnected',
    deviceType: 'Portable WiFi',
    connectionType: '5G',
    updatedBy: 'Store Supervisor',
    lastUpdated: 'May 12, 2026',
    duplicateSsid: true,
    publicIpCount: 0,
    logs: [
      {
        actor: 'Store Supervisor',
        detail: 'Disconnected after SIM replacement. Pending retest.',
        timestamp: 'May 12, 2026 10:44',
      },
    ],
  },
]

export async function fetchWifiDataRows(): Promise<WifiDataRecord[]> {
  const response = await wifiDataApi.list()
  const rows = Array.isArray(response.data) ? response.data : response.data?.data ?? []

  return rows as WifiDataRecord[]
}

export const locationOptions = [
  'Head Office',
  'Head Office Internet Provider',
  'Avada Center Branch',
  'Store Internet Provider',
]

export const ispOptions = ['PLDT', 'Converge', 'Openline']

export function getDefaultWifiFormValues(): WifiDataFormValues {
  return {
    location: 'Head Office',
    areaFloor: '',
    ispProvider: 'PLDT',
    routerBrand: '',
    routerModel: '',
    portalUsername: '',
    portalPassword: '',
    ssidName: '',
    wifiPassword: '',
    wanIp: '',
    gatewayIp: '',
    lanIp: '',
    deviceIp: '',
    macAddress: '',
    simNumber: '',
    notes: '',
    status: 'Active',
    deviceType: 'ISP Modem',
    connectionType: 'Fiber',
  }
}
