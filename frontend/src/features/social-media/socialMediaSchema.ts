import { z } from 'zod'

export const socialMediaTypeOptions = [
  'Facebook',
  'Instagram',
  'TikTok',
  'Shopee',
  'Lazada',
  'Shopify',
  'Gmail',
  'Marketplace',
  'Seller Center',
  'Other',
] as const

export const socialMediaStatusOptions = [
  'Active',
  'Inactive',
  'For Checking',
  'Missing Details',
  'Password Updated',
  'Disabled',
] as const

const phoneSchema = z
  .string()
  .regex(/^[+()0-9 -]{7,20}$/, 'Enter a valid phone number')
  .or(z.literal(''))

export const socialMediaSchema = z.object({
  type: z.enum(socialMediaTypeOptions),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').or(z.literal('')),
  department: z.string().min(2, 'Department is required'),
  personUsed: z.string().optional(),
  shopName: z.string().optional(),
  sellerIdShopCode: z.string().optional(),
  phoneNumber: phoneSchema,
  status: z.enum(socialMediaStatusOptions),
  notes: z.string().optional(),
})

export type SocialMediaFormValues = z.infer<typeof socialMediaSchema>

