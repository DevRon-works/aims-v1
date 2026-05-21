import { zodResolver } from '@hookform/resolvers/zod'
import { Network, RadioTower, Save } from '../../lib/icons'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
import { normalizeApiError } from '../../lib/apiErrors'
import { ImportExcelDropzone } from '../../components/import/ImportExcelDropzone'
import {
  createIpAddressingRecord,
  getDefaultIpAddressingFormValues,
  ipDepartmentOptions,
  ipLocationOptions,
  updateIpAddressingRecord,
  type IpConnectionTestResult,
  type IpAddressingRecord,
} from './ipAddressingData'
import {
  ipDeviceTypeOptions,
  ipAddressingSchema,
  ipStatusOptions,
  type IpAddressingFormValues,
} from './ipAddressingSchema'

type IpAddressingModalProps = {
  mode: 'add' | 'edit'
  open: boolean
  record?: IpAddressingRecord | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

type ReadonlyModalProps = {
  open: boolean
  record: IpAddressingRecord | null
  onOpenChange: (open: boolean) => void
}

type ConnectionTestModalProps = ReadonlyModalProps & {
  isTesting: boolean
  result: IpConnectionTestResult | null
}

const textFields = [
  {
    name: 'name',
    label: 'Name',
    placeholder: 'Assigned user or area',
  },
  {
    name: 'deviceName',
    label: 'Device Name',
    placeholder: 'Accounting-PC-01, HR-Laptop-02, Samsung A55, POS-FrontDesk, CCTV-NVR-01',
  },
  {
    name: 'macAddress',
    label: 'MAC Address',
    placeholder: 'AC:23:3F:91:42:10',
  },
  {
    name: 'ipAddress',
    label: 'IP Address',
    placeholder: '192.168.10.45',
  },
] as const

const backendFieldMap: Record<string, keyof IpAddressingFormValues> = {
  device_type: 'deviceType',
  location: 'location',
  name: 'name',
  department: 'department',
  device_name: 'deviceName',
  mac_address: 'macAddress',
  ip_address: 'ipAddress',
  status: 'status',
  notes: 'notes',
}

function IpAddressingFormModal({
  mode,
  open,
  record,
  onOpenChange,
  onSaved,
}: IpAddressingModalProps) {
  const form = useForm<IpAddressingFormValues>({
    resolver: zodResolver(ipAddressingSchema),
    defaultValues: record ?? getDefaultIpAddressingFormValues(),
  })

  useEffect(() => {
    form.reset(record ?? getDefaultIpAddressingFormValues())
  }, [form, record, open])

  async function handleSubmit(values: IpAddressingFormValues) {
    try {
      ipAddressingSchema.parse(values)
      if (mode === 'edit' && record) {
        await updateIpAddressingRecord(record.id, values)
      } else {
        await createIpAddressingRecord(values)
      }
      onSaved()
      onOpenChange(false)
    } catch (error) {
      const normalizedError = normalizeApiError(error)

      if (normalizedError.status === 422) {
        Object.entries(normalizedError.errors ?? {}).forEach(([backendField, messages]) => {
          const field = backendFieldMap[backendField]
          const message = Array.isArray(messages) ? messages[0] : String(messages)

          if (field && message) {
            form.setError(field, { type: 'server', message })
          }
        })
      }

      toast.error(normalizedError.message ?? 'Unable to save IP address record.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pos-dialog">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add IP Address' : 'Edit IP Address'}</DialogTitle>
          <DialogDescription>
            Validate IP and MAC format, detect duplicates, and preserve audit history
            for network assignments.
          </DialogDescription>
        </DialogHeader>

        <form className="wifi-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="wifi-form-grid">
            <label className="field-group">
              <span className="label">Device Type</span>
              <Select {...form.register('deviceType')}>
                {ipDeviceTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <FieldError message={form.formState.errors.deviceType?.message} />
            </label>

            <label className="field-group">
              <span className="label">Location</span>
              <Select {...form.register('location')}>
                {ipLocationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <FieldError message={form.formState.errors.location?.message} />
            </label>

            <label className="field-group">
              <span className="label">Department</span>
              <Select {...form.register('department')}>
                {ipDepartmentOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <FieldError message={form.formState.errors.department?.message} />
            </label>

            <label className="field-group">
              <span className="label">Status</span>
              <Select {...form.register('status')}>
                {ipStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            {textFields.map(({ name, label, placeholder }) => (
              <label className="field-group" key={name}>
                <span className="label">{label}</span>
                <Input
                  aria-invalid={Boolean(form.formState.errors[name])}
                  placeholder={placeholder}
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
              {form.formState.isSubmitting ? 'Saving...' : 'Save IP Address'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ViewIpDetailsModal({ open, record, onOpenChange }: ReadonlyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pos-dialog pos-details-dialog">
        <DialogHeader>
          <DialogTitle>View IP Details</DialogTitle>
          <DialogDescription>
            Review device assignment, duplicate flags, missing fields, and audit logs.
          </DialogDescription>
        </DialogHeader>
        {record ? (
          <div className="network-detail-grid">
            <div className="network-detail-main">
              {[
                ['Location', record.location],
                ['Device Type', record.deviceType === 'mobile' ? 'Mobile' : 'Desktop'],
                ['Name', record.name],
                ['Department', record.department],
                ['Device Name', record.deviceName],
                ['MAC Address', record.macAddress],
                ['IP Address', record.ipAddress],
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
                <Network aria-hidden="true" size={58} />
                <strong>Address Assignment</strong>
                <span>
                  {record.duplicateIp || record.duplicateMac
                    ? 'Duplicate detected and needs review'
                    : 'IP and MAC details are tracked'}
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

function IpConnectionTestModal({
  isTesting,
  open,
  record,
  result,
  onOpenChange,
}: ConnectionTestModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="wifi-test-dialog">
        <DialogHeader>
          <DialogTitle>Test Connection</DialogTitle>
          <DialogDescription>
            {isTesting && record
              ? `Pinging ${record.ipAddress}...`
              : 'Review the backend ping result for this selected IP address.'}
          </DialogDescription>
        </DialogHeader>
        {record ? (
          <div className="connection-test-stack">
            <div className="connection-test-panel">
              <span className="connection-test-icon">
                <RadioTower aria-hidden="true" size={24} />
              </span>
              <div>
                <p className="connection-test-title">{record.deviceName}</p>
                <p className="connection-test-copy">
                  {isTesting
                    ? `Pinging ${record.ipAddress}...`
                    : `Tested ${result?.ipAddress ?? record.ipAddress} assigned to ${record.name}.`}
                </p>
              </div>
              <Badge variant={result?.online ? 'success' : 'destructive'}>
                {isTesting ? 'Testing' : result?.online ? 'Online' : 'Offline'}
              </Badge>
            </div>

            {!isTesting && result ? (
              <>
                <div className="connection-test-metrics">
                  <div>
                    <span>IP address tested</span>
                    <strong>{result.ipAddress}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{result.online ? 'Online' : 'Offline'}</strong>
                  </div>
                  <div>
                    <span>Average latency</span>
                    <strong>
                      {result.averageLatencyMs === null
                        ? 'Unavailable'
                        : `${result.averageLatencyMs} ms`}
                    </strong>
                  </div>
                  <div>
                    <span>Packet loss</span>
                    <strong>
                      {result.packetLossPercent === null
                        ? 'Unavailable'
                        : `${result.packetLossPercent}%`}
                    </strong>
                  </div>
                </div>
                <pre className="connection-test-output">{result.output || 'No output returned.'}</pre>
              </>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function IpImportExcelModal({
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
            Import IP assignments and run IP format, MAC format, duplicate, and
            missing-data checks using Device Name for all network-connected assets.
          </DialogDescription>
        </DialogHeader>
        <ImportExcelDropzone
          description="Expected columns include Device Type, Device Name, MAC Address, IP Address, Location, Department, and Status."
          title="Drop IP addressing workbook here"
        />
      </DialogContent>
    </Dialog>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="field-error">{message}</span> : null
}

export {
  IpAddressingFormModal,
  IpConnectionTestModal,
  IpImportExcelModal,
  ViewIpDetailsModal,
}

