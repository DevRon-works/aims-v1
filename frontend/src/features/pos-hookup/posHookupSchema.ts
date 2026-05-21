import { z } from 'zod'

export const posStatusOptions = [
  'Active',
  'Offline',
  'For Checking',
  'Missing Details',
  'Maintenance',
  'Disconnected',
] as const

const ipv4Schema = z
  .string()
  .regex(
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
    'Enter a valid IPv4 address',
  )

export const posHookupSchema = z.object({
  branch: z.string().min(2, 'Branch is required'),
  contractNumber: z.string().min(2, 'Contract number is required'),
  code: z.string().min(1, 'POS code is required'),
  ipAddress: ipv4Schema,
  subnetMask: ipv4Schema,
  gateway: ipv4Schema,
  mallServerIp: ipv4Schema,
  ssidUsername: z.string().min(2, 'SSID / username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  salesPath: z.string().min(2, 'Sales path is required'),
  status: z.enum(posStatusOptions),
  notes: z.string().optional(),
})

export type PosHookupFormValues = z.infer<typeof posHookupSchema>

