import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from '../../lib/icons'
import { useEffect } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { normalizeApiError } from '../../lib/apiErrors'
import { EmailCombobox } from './EmailCombobox'
import {
  createEmailRecord,
  fetchEmailRecord,
  getDefaultEmailAccountFormValues,
  updateEmailRecord,
  type EmailOptions,
  type EmailAccountRecord,
} from './emailsData'
import {
  emailAccountSchema,
  type EmailAccountFormValues,
} from './emailsSchema'

type EmailFormModalProps = {
  mode: 'add' | 'edit'
  open: boolean
  canViewSecret: boolean
  options: EmailOptions
  record?: EmailAccountRecord | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

function EmailFormModal({
  mode,
  open,
  canViewSecret,
  options,
  record,
  onOpenChange,
  onSaved,
}: EmailFormModalProps) {
  const form = useForm<EmailAccountFormValues>({
    resolver: zodResolver(emailAccountSchema),
    defaultValues: record ?? getDefaultEmailAccountFormValues(),
  })

  useEffect(() => {
    if (!open) {
      return
    }

    if (mode === 'edit' && record?.id && canViewSecret) {
      fetchEmailRecord(record.id, { withSecret: true })
        .then((freshRecord) => form.reset(freshRecord))
        .catch(() => form.reset(record))
      return
    }

    form.reset(record ?? getDefaultEmailAccountFormValues())
  }, [canViewSecret, form, mode, open, record])

  async function handleSubmit(values: EmailAccountFormValues) {
    try {
      emailAccountSchema.parse(values)
      if (mode === 'edit' && record) {
        await updateEmailRecord(record.id, {
          ...values,
          password: canViewSecret ? values.password : undefined,
        })
      } else {
        await createEmailRecord(values)
      }
      toast.success(mode === 'edit' ? 'Email updated successfully' : 'Email added successfully')
      onSaved()
      onOpenChange(false)
    } catch (error) {
      const normalizedError = normalizeApiError(error)

      Object.entries(normalizedError.errors ?? {}).forEach(([key, messages]) => {
        const fieldName = serverFieldToFormField(key)
        const message = Array.isArray(messages) ? messages[0] : String(messages)
        form.setError(fieldName, { message })
      })

      toast.error(normalizedError.message ?? 'Unable to save email record.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="accounts-dialog">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Email' : 'Edit Email'}</DialogTitle>
          <DialogDescription>
            Maintain email type, account, password, department, purpose, and recovery verification.
          </DialogDescription>
        </DialogHeader>

        <form className="wifi-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="wifi-form-grid">
            <EmailCombobox
              error={form.formState.errors.emailsType?.message}
              label="Emails Type"
              options={options.emailsTypes}
              placeholder="Type or select emails type"
              value={form.watch('emailsType') ?? ''}
              onChange={(value) => form.setValue('emailsType', value, { shouldDirty: true, shouldValidate: true })}
            />

            <FormInput
              error={form.formState.errors.emailAccount?.message}
              label="Email Account"
              registration={form.register('emailAccount')}
            />

            <FormInput
              disabled={!canViewSecret}
              error={form.formState.errors.password?.message}
              label="Password"
              registration={form.register('password')}
              type="password"
            />

            <EmailCombobox
              error={form.formState.errors.department?.message}
              label="Department"
              options={options.departments}
              placeholder="Type or select department"
              value={form.watch('department') ?? ''}
              onChange={(value) => form.setValue('department', value, { shouldDirty: true, shouldValidate: true })}
            />

            <FormInput
              error={form.formState.errors.personUsed?.message}
              label="Person Used"
              registration={form.register('personUsed')}
            />

            <label className="field-group wifi-form-notes">
              <span className="label">Purpose</span>
              <Textarea rows={3} {...form.register('purpose')} />
              <FieldError message={form.formState.errors.purpose?.message} />
            </label>

            <FormInput
              error={form.formState.errors.recoveryEmail?.message}
              label="Recovery Email"
              registration={form.register('recoveryEmail')}
              type="email"
            />

            <label className="field-group wifi-form-notes">
              <span className="label">Recovery Number & Verification</span>
              <Textarea rows={3} {...form.register('recoveryNumberVerification')} />
              <FieldError message={form.formState.errors.recoveryNumberVerification?.message} />
            </label>
          </div>

          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Save aria-hidden="true" size={16} />
              Save Email
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function serverFieldToFormField(field: string): keyof EmailAccountFormValues {
  const fields: Record<string, keyof EmailAccountFormValues> = {
    emails_type: 'emailsType',
    email_account: 'emailAccount',
    password: 'password',
    department: 'department',
    recovery_email: 'recoveryEmail',
    person_used: 'personUsed',
    purpose: 'purpose',
    recovery_number_verification: 'recoveryNumberVerification',
  }

  return fields[field] ?? (field as keyof EmailAccountFormValues)
}

function FormInput({
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
    <label className="field-group">
      <span className="label">{label}</span>
      <Input aria-invalid={Boolean(error)} disabled={disabled} type={type} {...registration} />
      <FieldError message={error} />
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="field-error">{message}</span> : null
}

export { EmailFormModal }
