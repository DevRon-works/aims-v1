import { z } from 'zod'

export const ipStatusOptions = [
  'Active',
  'Offline',
  'Reserved',
  'Available',
  'Conflict',
  'Replaced',
] as const

export const ipDeviceTypeOptions = [
  { label: 'Desktop', value: 'desktop' },
  { label: 'Mobile', value: 'mobile' },
] as const

const ipv4Schema = z.string().regex(
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
  'Enter a valid IPv4 address',
)

const macSchema = z.string().regex(
  /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
  'Enter a valid MAC address',
)

export const ipAddressingSchema = z.object({
  deviceType: z.enum(['desktop', 'mobile']),
  location: z.string().min(2, 'Location is required'),
  name: z.string().min(2, 'Name is required'),
  department: z.string().min(2, 'Department is required'),
  deviceName: z.string().min(2, 'Device name is required'),
  macAddress: macSchema,
  ipAddress: ipv4Schema,
  status: z.enum(ipStatusOptions),
  notes: z.string().optional(),
})

export type IpAddressingFormValues = z.infer<typeof ipAddressingSchema>
