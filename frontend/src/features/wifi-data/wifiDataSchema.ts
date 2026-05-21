import { z } from 'zod'

export const deviceTypeOptions = [
  'ISP Modem',
  'Third Party Router',
  'Access Point',
  'Portable WiFi',
  'Switch',
  'CCTV Network',
  'Office Router',
] as const

export const statusOptions = [
  'Active',
  'Offline',
  'Maintenance',
  'Slow Connection',
  'Disconnected',
] as const

export const connectionTypeOptions = [
  'Fiber',
  'DSL',
  'LTE',
  '5G',
  'Wireless Bridge',
] as const

const ipv4Schema = z
  .string()
  .regex(
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
    'Enter a valid IPv4 address',
  )

export const wifiDataSchema = z.object({
  location: z.string().min(2, 'Branch / location is required'),
  areaFloor: z.string().min(1, 'Floor / area is required'),
  ispProvider: z.string().min(2, 'ISP provider is required'),
  routerBrand: z.string().min(2, 'Router brand is required'),
  routerModel: z.string().min(1, 'Router model is required'),
  portalUsername: z.string().min(1, 'Portal username is required'),
  portalPassword: z.string().min(6, 'Portal password must be at least 6 characters'),
  ssidName: z.string().min(2, 'SSID is required'),
  wifiPassword: z.string().min(8, 'WiFi password must be at least 8 characters'),
  wanIp: ipv4Schema,
  gatewayIp: ipv4Schema,
  lanIp: ipv4Schema,
  deviceIp: ipv4Schema,
  macAddress: z.string().min(12, 'MAC address is required'),
  simNumber: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(statusOptions),
  deviceType: z.enum(deviceTypeOptions),
  connectionType: z.enum(connectionTypeOptions),
})

export type WifiDataFormValues = z.infer<typeof wifiDataSchema>
