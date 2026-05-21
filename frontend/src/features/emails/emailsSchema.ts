import { z } from 'zod'

export const emailAccountSchema = z.object({
  emailsType: z.string().min(1, 'Emails type is required'),
  emailAccount: z.string().email('Enter a valid email account'),
  password: z.string().optional(),
  recoveryEmail: z.string().email('Enter a valid recovery email').or(z.literal('')),
  department: z.string().optional(),
  personUsed: z.string().optional(),
  purpose: z.string().optional(),
  recoveryNumberVerification: z.string().optional(),
})

export type EmailAccountFormValues = z.infer<typeof emailAccountSchema>
