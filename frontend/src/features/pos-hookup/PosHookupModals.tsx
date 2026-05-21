import { zodResolver } from '@hookform/resolvers/zod'
import { FolderOpen, RadioTower, Save } from '../../lib/icons'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Badge } from '../../components/ui/badge'
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
  getDefaultPosHookupFormValues,
  mallServerOptions,
  posBranchOptions,
  type PosHookupRecord,
} from './posHookupData'
import {
  posHookupSchema,
  posStatusOptions,
  type PosHookupFormValues,
} from './posHookupSchema'

type PosHookupModalProps = {
  mode: 'add' | 'edit'
  open: boolean
  record?: PosHookupRecord | null
  onOpenChange: (open: boolean) => void
}

type ReadonlyModalProps = {
  open: boolean
  record: PosHookupRecord | null
  onOpenChange: (open: boolean) => void
}

const textFields = [
  ['contractNumber', 'Contract Number'],
  ['code', 'Code'],
  ['ipAddress', 'IP Address'],
  ['subnetMask', 'Subnet Mask'],
  ['gateway', 'Gateway'],
  ['ssidUsername', 'SSID / Username'],
  ['password', 'Password'],
  ['salesPath', 'Sales Path'],
] as const

function PosHookupFormModal({ mode, open, record, onOpenChange }: PosHookupModalProps) {
  const form = useForm<PosHookupFormValues>({
    resolver: zodResolver(posHookupSchema),
    defaultValues: record ?? getDefaultPosHookupFormValues(),
  })

  useEffect(() => {
    form.reset(record ?? getDefaultPosHookupFormValues())
  }, [form, record, open])

  function handleSubmit(values: PosHookupFormValues) {
    posHookupSchema.parse(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pos-dialog">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add POS Hookup' : 'Edit POS Hookup'}</DialogTitle>
          <DialogDescription>
            Validate IP format, keep credentials encrypted in the backend, and append
            audit logs when POS hookup records are edited.
          </DialogDescription>
        </DialogHeader>

        <form className="wifi-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="wifi-form-grid">
            <label className="field-group">
              <span className="label">Branch</span>
              <Select {...form.register('branch')}>
                {posBranchOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <FieldError message={form.formState.errors.branch?.message} />
            </label>

            <label className="field-group">
              <span className="label">Mall Serve IP</span>
              <Select {...form.register('mallServerIp')}>
                {mallServerOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <FieldError message={form.formState.errors.mallServerIp?.message} />
            </label>

            <label className="field-group">
              <span className="label">Status</span>
              <Select {...form.register('status')}>
                {posStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            {textFields.map(([name, label]) => (
              <label className="field-group" key={name}>
                <span className="label">{label}</span>
                <Input
                  aria-invalid={Boolean(form.formState.errors[name])}
                  type={name === 'password' ? 'password' : 'text'}
                  {...form.register(name)}
                />
                <FieldError message={form.formState.errors[name]?.message} />
              </label>
            ))}

            <label className="field-group wifi-form-notes">
              <span className="label">Notes</span>
              <Textarea rows={3} {...form.register('notes')} />
            </label>
          </div>

          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Save aria-hidden="true" size={16} />
              Save POS Hookup
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ViewPosDetailsModal({ open, record, onOpenChange }: ReadonlyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pos-dialog pos-details-dialog">
        <DialogHeader>
          <DialogTitle>View POS Details</DialogTitle>
          <DialogDescription>
            Review POS network settings, sales path, missing fields, and audit history.
          </DialogDescription>
        </DialogHeader>
        {record ? (
          <div className="network-detail-grid">
            <div className="network-detail-main">
              {[
                ['Branch', record.branch],
                ['Contract #', record.contractNumber],
                ['Code', record.code],
                ['IP Address', record.ipAddress],
                ['Subnet Mask', record.subnetMask],
                ['Gateway', record.gateway],
                ['Mall Serve IP', record.mallServerIp],
                ['Sales Path', record.salesPath || 'Missing'],
                ['Updated By', record.updatedBy],
              ].map(([label, value]) => (
                <div className="detail-field" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="network-detail-side">
              <div className="qr-preview">
                <FolderOpen aria-hidden="true" size={58} />
                <strong>Sales Path Ready</strong>
                <span>{record.salesPath || 'Missing sales path requires follow-up'}</span>
              </div>
              <div className="audit-list">
                {record.logs.map((log) => (
                  <div className="audit-item" key={`${log.timestamp}-${log.detail}`}>
                    <strong>{log.detail}</strong>
                    <span>
                      {log.timestamp} - {log.actor}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function PosConnectionTestModal({ open, record, onOpenChange }: ReadonlyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="wifi-test-dialog">
        <DialogHeader>
          <DialogTitle>Connection Test</DialogTitle>
          <DialogDescription>
            Ping checks are ready to connect to a backend monitoring job.
          </DialogDescription>
        </DialogHeader>
        {record ? (
          <div className="connection-test-panel">
            <span className="connection-test-icon">
              <RadioTower aria-hidden="true" size={24} />
            </span>
            <div>
              <p className="connection-test-title">{record.code}</p>
              <p className="connection-test-copy">
                Testing {record.ipAddress} via gateway {record.gateway} at {record.branch}.
              </p>
            </div>
            <Badge variant={record.status === 'Active' ? 'success' : 'warning'}>
              {record.status === 'Active' ? 'Reachable' : 'Needs review'}
            </Badge>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function PosImportExcelModal({
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
            Import POS hookup inventory and run duplicate IP plus missing-data checks.
          </DialogDescription>
        </DialogHeader>
        <ImportExcelDropzone
          description="Expected columns match the Add / Edit POS Hookup form."
          title="Drop POS hookup workbook here"
        />
      </DialogContent>
    </Dialog>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="field-error">{message}</span> : null
}

export {
  PosConnectionTestModal,
  PosHookupFormModal,
  PosImportExcelModal,
  ViewPosDetailsModal,
}

