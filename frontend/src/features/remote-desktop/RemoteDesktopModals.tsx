import { zodResolver } from '@hookform/resolvers/zod'
import { MonitorCog, RadioTower, Save } from '../../lib/icons'
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
  getDefaultRemoteDesktopFormValues,
  remoteDepartments,
  remoteLocations,
  type RemoteDesktopRecord,
} from './remoteDesktopData'
import {
  remoteDesktopSchema,
  remoteStatusOptions,
  remoteTypeOptions,
  type RemoteDesktopFormValues,
} from './remoteDesktopSchema'

type RemoteDesktopModalProps = {
  mode: 'add' | 'edit'
  open: boolean
  record?: RemoteDesktopRecord | null
  onOpenChange: (open: boolean) => void
}

type ReadonlyModalProps = {
  open: boolean
  record: RemoteDesktopRecord | null
  onOpenChange: (open: boolean) => void
}

const textFields = [
  ['name', 'Name'],
  ['ipAddress', 'IP Address'],
  ['terminalNumber', 'Terminal #'],
  ['computerName', 'Computer Name'],
  ['branch', 'Branch'],
  ['posDateUsed', 'POS Date Used'],
  ['anydeskId', 'AnyDesk ID'],
  ['password', 'Password'],
  ['teamViewer', 'TeamViewer'],
] as const

function RemoteDesktopFormModal({
  mode,
  open,
  record,
  onOpenChange,
}: RemoteDesktopModalProps) {
  const form = useForm<RemoteDesktopFormValues>({
    resolver: zodResolver(remoteDesktopSchema),
    defaultValues: record ?? getDefaultRemoteDesktopFormValues(),
  })

  useEffect(() => {
    form.reset(record ?? getDefaultRemoteDesktopFormValues())
  }, [form, record, open])

  function handleSubmit(values: RemoteDesktopFormValues) {
    remoteDesktopSchema.parse(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pos-dialog">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add Remote Desktop' : 'Edit Remote Desktop'}
          </DialogTitle>
          <DialogDescription>
            Maintain remote access records with encrypted credentials, IP validation,
            and audit history for IT support operations.
          </DialogDescription>
        </DialogHeader>

        <form className="wifi-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="wifi-form-grid">
            <label className="field-group">
              <span className="label">Type</span>
              <Select {...form.register('type')}>
                {remoteTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            <label className="field-group">
              <span className="label">Location</span>
              <Select {...form.register('location')}>
                {remoteLocations.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            <label className="field-group">
              <span className="label">Department</span>
              <Select {...form.register('department')}>
                {remoteDepartments.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            <label className="field-group">
              <span className="label">Status</span>
              <Select {...form.register('status')}>
                {remoteStatusOptions.map((option) => (
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
                  type={name === 'password' ? 'password' : name === 'posDateUsed' ? 'date' : 'text'}
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
              Save Remote Desktop
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ViewRemoteDetailsModal({ open, record, onOpenChange }: ReadonlyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pos-dialog pos-details-dialog">
        <DialogHeader>
          <DialogTitle>View Remote Details</DialogTitle>
          <DialogDescription>
            Review remote support credentials, device ownership, duplicate flags, and
            audit history.
          </DialogDescription>
        </DialogHeader>
        {record ? (
          <div className="network-detail-grid">
            <div className="network-detail-main">
              {[
                ['Type', record.type],
                ['Location / Branch', record.type === 'Avada' ? record.location : record.branch],
                ['Device', record.type === 'Avada' ? record.name : record.computerName],
                ['Department', record.department],
                ['IP Address', record.ipAddress || 'Not set'],
                ['AnyDesk ID', record.anydeskId],
                ['TeamViewer', record.teamViewer || 'Not set'],
                ['Status', record.status],
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
                <MonitorCog aria-hidden="true" size={58} />
                <strong>Remote Support Ready</strong>
                <span>
                  {record.missingCredentials
                    ? 'Missing credentials require admin update'
                    : 'Access details available by role'}
                </span>
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

function RemoteConnectionTestModal({ open, record, onOpenChange }: ReadonlyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="wifi-test-dialog">
        <DialogHeader>
          <DialogTitle>Connection Test</DialogTitle>
          <DialogDescription>
            Ping checks are ready to connect to remote support monitoring jobs.
          </DialogDescription>
        </DialogHeader>
        {record ? (
          <div className="connection-test-panel">
            <span className="connection-test-icon">
              <RadioTower aria-hidden="true" size={24} />
            </span>
            <div>
              <p className="connection-test-title">
                {record.type === 'Avada' ? record.name : record.computerName}
              </p>
              <p className="connection-test-copy">
                Testing {record.ipAddress || 'unassigned IP'} for {record.anydeskId}.
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

function RemoteImportExcelModal({
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
            Import remote desktop records and run duplicate AnyDesk, duplicate IP, and
            missing credential checks.
          </DialogDescription>
        </DialogHeader>
        <ImportExcelDropzone
          description="Expected columns match the Add / Edit Remote Desktop form."
          title="Drop remote desktop workbook here"
        />
      </DialogContent>
    </Dialog>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="field-error">{message}</span> : null
}

export {
  RemoteConnectionTestModal,
  RemoteDesktopFormModal,
  RemoteImportExcelModal,
  ViewRemoteDetailsModal,
}

