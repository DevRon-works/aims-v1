import { z } from 'zod'

export const accountTypeOptions = ['Store Account', 'PLDT Internet', 'Link Account'] as const

export const accountStatusOptions = [
  'Active',
  'Inactive',
  'Expired',
  'For Checking',
  'Disabled',
  'Missing Details',
  'Closed',
  'Updated',
] as const

export const linkAccountStatusOptions = [
  'Active',
  'Inactive',
  'Expired',
  'For Checking',
  'Disabled',
] as const

const contactSchema = z
  .string()
  .regex(/^[+()0-9 -]{7,20}$/, 'Enter a valid contact number')
  .or(z.literal(''))

export const accountSchema = z.object({
  accountType: z.enum(accountTypeOptions),
  merchantName: z.string().optional(),
  storeLocationName: z.string().optional(),
  storeAddress: z.string().optional(),
  storeManager: z.string().optional(),
  storeEmail: z.string().email('Enter a valid email').or(z.literal('')),
  storeContactNumber: contactSchema,
  bank: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  company: z.string().optional(),
  branch: z.string().optional(),
  pldtStatus: z.string().optional(),
  remarks: z.string().optional(),
  check: z.string().optional(),
  companyAccount: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email('Enter a valid email').or(z.literal('')),
  username: z.string().optional(),
  password: z.string().optional(),
  link: z.string().url('Enter a valid URL').or(z.literal('')),
  status: z.enum(accountStatusOptions),
  notes: z.string().optional(),
})

export type AccountFormValues = z.infer<typeof accountSchema>
