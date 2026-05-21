import { z } from 'zod'

export const cctvTypeOptions = ['Avada Center', 'Boutique', 'Warehouse / Online'] as const

export const cctvStatusOptions = ['Online', 'Offline'] as const

const ipv4Schema = z
  .string()
  .regex(
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
    'Enter a valid IPv4 address',
  )
  .or(z.literal(''))

export const cctvRecordSchema = z.object({
  type: z.enum(cctvTypeOptions),
  floorName: z.string().optional(),
  cameraNumber: z.string().optional(),
  cameraName: z.string().optional(),
  branch: z.string().optional(),
  brand: z.string().optional(),
  workingCameras: z.string().optional(),
  model: z.string().optional(),
  serial: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  nvrIp: ipv4Schema,
  cameraIp: ipv4Schema,
  webIp: ipv4Schema,
  storage: z.string().optional(),
  status: z.enum(cctvStatusOptions),
  notes: z.string().optional(),
})

export type CctvFormValues = z.infer<typeof cctvRecordSchema>
