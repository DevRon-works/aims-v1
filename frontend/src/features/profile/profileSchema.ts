import { z } from 'zod'

export const profileThemeOptions = ['light', 'dark', 'system'] as const

export const profileInfoSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Enter a valid email address'),
  contactNumber: z.string().min(7, 'Contact number is required'),
  avatarUrl: z.string().optional(),
})

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm the new password'),
    logoutAllDevices: z.boolean(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ProfileInfoFormValues = z.infer<typeof profileInfoSchema>
export type PasswordFormValues = z.infer<typeof passwordSchema>
export type ProfileThemeMode = (typeof profileThemeOptions)[number]
