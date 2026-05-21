import { zodResolver } from '@hookform/resolvers/zod'
import { History, Save, Share2 } from '../../lib/icons'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { ImportExcelDropzone } from '../../components/import/ImportExcelDropzone'
import {
  getDefaultSocialMediaFormValues,
  shopNameOptions,
  socialDepartments,
  socialPeople,
  type SocialMediaRecord,
} from './socialMediaData'
import {
  socialMediaSchema,
  socialMediaStatusOptions,
  socialMediaTypeOptions,
  type SocialMediaFormValues,
} from './socialMediaSchema'

type SocialMediaModalProps = {
  mode: 'add' | 'edit'
  open: boolean
  record?: SocialMediaRecord | null
  onOpenChange: (open: boolean) => void
}

type ReadonlyModalProps = {
  open: boolean
  record: SocialMediaRecord | null
  onOpenChange: (open: boolean) => void
}

function SocialMediaFormModal({ mode, open, record, onOpenChange }: SocialMediaModalProps) {
  const form = useForm<SocialMediaFormValues>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: record ?? getDefaultSocialMediaFormValues(),
  })

  useEffect(() => {
    form.reset(record ?? getDefaultSocialMediaFormValues())
  }, [form, record, open])

  function handleSubmit(values: SocialMediaFormValues) {
    socialMediaSchema.parse(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="accounts-dialog">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add Social Media Account' : 'Edit Social Media Account'}
          </DialogTitle>
          <DialogDescription>
            Maintain online account credentials, seller identifiers, shop ownership,
            and audit history for the online department.
          </DialogDescription>
        </DialogHeader>

        <form className="wifi-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="wifi-form-grid">
            <label className="field-group">
              <span className="label">Type</span>
              <Select {...form.register('type')}>
                {socialMediaTypeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </label>
            <label className="field-group">
              <span className="label">Department</span>
              <Select {...form.register('department')}>
                {socialDepartments.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </label>
            <label className="field-group">
              <span className="label">Person Used</span>
              <Select {...form.register('personUsed')}>
                <option value="">Unassigned</option>
                {socialPeople.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </label>
            <label className="field-group">
              <span className="label">Shop Name</span>
              <Select {...form.register('shopName')}>
                <option value="">No shop selected</option>
                {shopNameOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </label>
            <label className="field-group">
              <span className="label">Status</span>
              <Select {...form.register('status')}>
                {socialMediaStatusOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </label>

            {[
              ['email', 'Email'],
              ['password', 'Password'],
              ['sellerIdShopCode', 'Seller ID / Shop Code'],
              ['phoneNumber', 'Phone No.'],
            ].map(([name, label]) => (
              <label className="field-group" key={name}>
                <span className="label">{label}</span>
                <Input
                  aria-invalid={Boolean(form.formState.errors[name as keyof SocialMediaFormValues])}
                  type={name === 'password' ? 'password' : 'text'}
                  {...form.register(name as keyof SocialMediaFormValues)}
                />
                <FieldError message={form.formState.errors[name as keyof SocialMediaFormValues]?.message} />
              </label>
            ))}

            <label className="field-group wifi-form-notes">
              <span className="label">Notes</span>
              <Textarea rows={3} {...form.register('notes')} />
            </label>
          </div>
          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">
              <Save aria-hidden="true" size={16} />
              Save Social Media Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ViewSocialMediaDetailsModal({ open, record, onOpenChange }: ReadonlyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="accounts-dialog accounts-details-dialog">
        <DialogHeader>
          <DialogTitle>View Social Media Details</DialogTitle>
          <DialogDescription>
            Review online account assignment, seller identifiers, duplicate flags, and
            history logs.
          </DialogDescription>
        </DialogHeader>
        {record ? (
          <div className="network-detail-grid">
            <div className="network-detail-main">
              {[
                ['Type', record.type],
                ['Email', record.email],
                ['Department', record.department],
                ['Person Used', record.personUsed || 'Unassigned'],
                ['Shop Name', record.shopName || 'Missing'],
                ['Seller ID / Shop Code', record.sellerIdShopCode || 'Missing'],
                ['Phone No.', record.phoneNumber || 'Missing'],
                ['Status', record.status],
              ].map(([label, value]) => (
                <div className="detail-field" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="network-detail-side">
              <div className="qr-preview">
                <Share2 aria-hidden="true" size={58} />
                <strong>{record.shopName || record.type}</strong>
                <span>
                  {record.missingFields?.length
                    ? 'Missing required account details'
                    : 'Online account details tracked'}
                </span>
              </div>
              <SocialMediaAuditList record={record} />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function SocialMediaHistoryModal({ open, record, onOpenChange }: ReadonlyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="wifi-test-dialog">
        <DialogHeader>
          <DialogTitle>Account History</DialogTitle>
          <DialogDescription>Remarks and audit logs for this online account.</DialogDescription>
        </DialogHeader>
        {record ? <SocialMediaAuditList record={record} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function SocialMediaImportExcelModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="premium-import-dialog">
        <DialogHeader>
          <DialogTitle>Import Excel</DialogTitle>
          <DialogDescription>
            Import social media account records with duplicate email, duplicate seller
            code, and missing-data checks.
          </DialogDescription>
        </DialogHeader>
        <ImportExcelDropzone
          description="Expected columns match the Add / Edit Social Media Account form."
          title="Drop social media workbook here"
        />
      </DialogContent>
    </Dialog>
  )
}

function SocialMediaAuditList({ record }: { record: SocialMediaRecord }) {
  return (
    <div className="audit-list">
      {record.logs.map((log) => (
        <div className="audit-item" key={`${log.timestamp}-${log.detail}`}>
          <strong>
            <History aria-hidden="true" size={14} />
            {log.detail}
          </strong>
          <span>{log.timestamp} - {log.actor}</span>
        </div>
      ))}
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="field-error">{message}</span> : null
}

export {
  SocialMediaFormModal,
  SocialMediaHistoryModal,
  SocialMediaImportExcelModal,
  ViewSocialMediaDetailsModal,
}

