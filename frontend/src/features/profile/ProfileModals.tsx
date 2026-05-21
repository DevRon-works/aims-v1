import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Eye, EyeOff, KeyRound, Save } from '../../lib/icons'
import { useEffect, useMemo, useState } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import type { UserProfile } from './profileData'
import {
  passwordSchema,
  profileInfoSchema,
  type PasswordFormValues,
  type ProfileInfoFormValues,
} from './profileSchema'

type EditProfileModalProps = {
  allowUsernameChange: boolean
  open: boolean
  profile: UserProfile
  onOpenChange: (open: boolean) => void
  onSave: (values: ProfileInfoFormValues) => void
}

type ChangePasswordModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function EditProfileModal({
  allowUsernameChange,
  open,
  profile,
  onOpenChange,
  onSave,
}: EditProfileModalProps) {
  const form = useForm<ProfileInfoFormValues>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      name: profile.name,
      username: profile.username,
      email: profile.email,
      contactNumber: profile.contactNumber,
      avatarUrl: profile.avatarUrl,
    },
  })

  useEffect(() => {
    form.reset({
      name: profile.name,
      username: profile.username,
      email: profile.email,
      contactNumber: profile.contactNumber,
      avatarUrl: profile.avatarUrl,
    })
  }, [form, open, profile])

  function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      form.setValue('avatarUrl', String(reader.result ?? ''), { shouldDirty: true })
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(values: ProfileInfoFormValues) {
    onSave({
      ...values,
      username: allowUsernameChange ? values.username : profile.username,
    })
    onOpenChange(false)
  }

  const avatarUrl = form.watch('avatarUrl')
  const displayName = form.watch('name') || profile.name
  const initials = getInitials(displayName)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="profile-dialog">
        <DialogHeader>
          <DialogTitle>Edit Personal Info</DialogTitle>
          <DialogDescription>
            Update your own profile details. Role, permissions, department, branch, and
            account status are administrator-managed.
          </DialogDescription>
        </DialogHeader>

        <form className="modal-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="profile-image-preview">
            <span className="avatar profile-avatar">
              {avatarUrl ? (
                <img alt="" className="avatar-image" src={avatarUrl} />
              ) : (
                <span className="avatar-fallback">{initials}</span>
              )}
            </span>
            <div className="field-group">
              <Label>Profile photo</Label>
              <label className="logo-upload-button profile-upload-button">
                <Camera aria-hidden="true" size={17} />
                Upload photo
                <input accept="image/*" type="file" onChange={handleAvatarUpload} />
              </label>
            </div>
          </div>

          <div className="profile-form-grid">
            <ProfileField
              error={form.formState.errors.name?.message}
              label="Full name"
              registration={form.register('name')}
            />
            <ProfileField
              disabled={!allowUsernameChange}
              error={form.formState.errors.username?.message}
              label="Username"
              registration={form.register('username')}
            />
            <ProfileField
              error={form.formState.errors.email?.message}
              label="Email"
              registration={form.register('email')}
              type="email"
            />
            <ProfileField
              error={form.formState.errors.contactNumber?.message}
              label="Contact number"
              registration={form.register('contactNumber')}
            />
          </div>

          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Save aria-hidden="true" size={16} />
              Save Profile
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ChangePasswordModal({ open, onOpenChange }: ChangePasswordModalProps) {
  const [showPasswords, setShowPasswords] = useState(false)
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      logoutAllDevices: true,
    },
  })
  const newPassword = form.watch('newPassword')
  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword])

  useEffect(() => {
    if (!open) {
      form.reset()
      setShowPasswords(false)
    }
  }, [form, open])

  function handleSubmit(values: PasswordFormValues) {
    passwordSchema.parse(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="profile-dialog profile-password-dialog">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Update your password and optionally sign out active sessions across devices.
          </DialogDescription>
        </DialogHeader>

        <form className="modal-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="profile-password-head">
            <span className="settings-card-icon">
              <KeyRound aria-hidden="true" size={18} />
            </span>
            <button
              className="button button-ghost profile-password-visibility"
              type="button"
              onClick={() => setShowPasswords((current) => !current)}
            >
              {showPasswords ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
              {showPasswords ? 'Hide passwords' : 'Show passwords'}
            </button>
          </div>

          <div className="profile-form-grid single-column">
            <ProfileField
              error={form.formState.errors.currentPassword?.message}
              label="Current password"
              registration={form.register('currentPassword')}
              type={showPasswords ? 'text' : 'password'}
            />
            <ProfileField
              error={form.formState.errors.newPassword?.message}
              label="New password"
              registration={form.register('newPassword')}
              type={showPasswords ? 'text' : 'password'}
            />
            <div className="password-strength">
              <span>Password strength</span>
              <div className="password-strength-track">
                <span
                  className={`password-strength-fill password-strength-${strength.level}`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
              <strong>{strength.label}</strong>
            </div>
            <ProfileField
              error={form.formState.errors.confirmPassword?.message}
              label="Confirm new password"
              registration={form.register('confirmPassword')}
              type={showPasswords ? 'text' : 'password'}
            />
          </div>

          <Label className="settings-toggle-row">
            <Checkbox {...form.register('logoutAllDevices')} />
            <span>
              <strong>Logout all devices after password change</strong>
              <small>End other active sessions once this password is saved.</small>
            </span>
          </Label>

          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Save aria-hidden="true" size={16} />
              Change Password
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ProfileField({
  disabled,
  error,
  label,
  registration,
  type = 'text',
}: {
  disabled?: boolean
  error?: string
  label: string
  registration: UseFormRegisterReturn
  type?: string
}) {
  return (
    <div className="field-group">
      <Label>{label}</Label>
      <Input aria-invalid={Boolean(error)} disabled={disabled} type={type} {...registration} />
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  )
}

function getPasswordStrength(password: string) {
  let score = 0

  if (password.length >= 8) score += 25
  if (/[A-Z]/.test(password)) score += 25
  if (/\d/.test(password)) score += 25
  if (/[^A-Za-z0-9]/.test(password)) score += 25

  if (score >= 100) return { label: 'Strong', level: 'strong', score }
  if (score >= 75) return { label: 'Good', level: 'good', score }
  if (score >= 50) return { label: 'Fair', level: 'fair', score }
  return { label: password ? 'Weak' : 'Not started', level: 'weak', score: Math.max(score, 10) }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export { ChangePasswordModal, EditProfileModal }
