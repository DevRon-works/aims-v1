import { z } from 'zod'

export const remoteTypeOptions = ['Avada', 'Boutique'] as const

export const remoteStatusOptions = [
  'Active',
  'Offline',
  'For Checking',
  'No Access',
  'Maintenance',
  'Replaced',
] as const

const ipv4Schema = z
  .string()
  .regex(
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
    'Enter a valid IPv4 address',
  )
  .or(z.literal(''))

export const remoteDesktopSchema = z.object({
  type: z.enum(remoteTypeOptions),
  location: z.string().optional(),
  name: z.string().optional(),
  department: z.string().optional(),
  ipAddress: ipv4Schema,
  terminalNumber: z.string().optional(),
  computerName: z.string().optional(),
  branch: z.string().optional(),
  posDateUsed: z.string().optional(),
  anydeskId: z.string().min(3, 'AnyDesk ID is required'),
  password: z.string().optional(),
  teamViewer: z.string().optional(),
  status: z.enum(remoteStatusOptions),
  notes: z.string().optional(),
})

export type RemoteDesktopFormValues = z.infer<typeof remoteDesktopSchema>

