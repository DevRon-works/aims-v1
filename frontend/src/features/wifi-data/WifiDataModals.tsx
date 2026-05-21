import { zodResolver } from '@hookform/resolvers/zod'
import { QrCode, RadioTower, Save } from '../../lib/icons'
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
  connectionTypeOptions,
  deviceTypeOptions,
  statusOptions,
  wifiDataSchema,
} from './wifiDataSchema'
import type { WifiDataFormValues } from './wifiDataSchema'
import type { WifiDataRecord } from './wifiData'
import { getDefaultWifiFormValues, ispOptions, locationOptions } from './wifiData'

type WifiDataModalProps = {
  mode: 'add' | 'edit'
  open: boolean
  record?: WifiDataRecord | null
  onOpenChange: (open: boolean) => void
}

type ReadonlyModalProps = {
  open: boolean
  record: WifiDataRecord | null
  onOpenChange: (open: boolean) => void
}

const textFields = [
  ['areaFloor', 'Floor / Area'],
  ['routerBrand', 'Router Brand'],
  ['routerModel', 'Router Model'],
  ['portalUsername', 'Portal Username'],
  ['portalPassword', 'Portal Password'],
  ['ssidName', 'SSID'],
  ['wifiPassword', 'WiFi Password'],
  ['wanIp', 'WAN IP'],
  ['gatewayIp', 'Gateway IP'],
  ['lanIp', 'LAN IP'],
  ['deviceIp', 'Device IP'],
  ['macAddress', 'MAC Address'],
  ['simNumber', 'SIM Number'],
] as const

function WifiDataFormModal({ mode, open, record, onOpenChange }: WifiDataModalProps) {
  const form = useForm<WifiDataFormValues>({
    resolver: zodResolver(wifiDataSchema),
    defaultValues: record ?? getDefaultWifiFormValues(),
  })
  const title = mode === 'add' ? 'Add WiFi Data' : 'Edit WiFi Data'

  useEffect(() => {
    form.reset(record ?? getDefaultWifiFormValues())
  }, [form, record, open])

  function handleSubmit(values: WifiDataFormValues) {
    wifiDataSchema.parse(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="wifi-dialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Store portal and WiFi passwords encrypted in the backend and append audit
            remarks whenever a record changes.
          </DialogDescription>
        </DialogHeader>

        <form className="wifi-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="wifi-form-grid">
            <label className="field-group">
              <span className="label">Branch / Location</span>
              <Select {...form.register('location')}>
                {locationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <FieldError message={form.formState.errors.location?.message} />
            </label>

            <label className="field-group">
              <span className="label">ISP Provider</span>
              <Select {...form.register('ispProvider')}>
                {ispOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <FieldError message={form.formState.errors.ispProvider?.message} />
            </label>

            <label className="field-group">
              <span className="label">Device Type</span>
              <Select {...form.register('deviceType')}>
                {deviceTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            <label className="field-group">
              <span className="label">Connection Type</span>
              <Select {...form.register('connectionType')}>
                {connectionTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            <label className="field-group">
              <span className="label">Status</span>
              <Select {...form.register('status')}>
                {statusOptions.map((option) => (
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
                  type={name.includes('Password') ? 'password' : 'text'}
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
              Save WiFi Data
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ViewNetworkDetailsModal({ open, record, onOpenChange }: ReadonlyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="wifi-dialog wifi-details-dialog">
        <DialogHeader>
          <DialogTitle>View Network Details</DialogTitle>
          <DialogDescription>
            Review SSIDs, router information, audit history, and QR access readiness.
          </DialogDescription>
        </DialogHeader>
        {record ? (
          <div className="network-detail-grid">
            <div className="network-detail-main">
              {[
                ['Location', record.location],
                ['Area / Floor', record.areaFloor],
                ['ISP Provider', record.ispProvider],
                ['Router', `${record.routerBrand} ${record.routerModel}`],
                ['SSID', record.ssidName],
                ['WAN IP', record.wanIp],
                ['Gateway IP', record.gatewayIp],
                ['Device IP', record.deviceIp],
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
                <QrCode aria-hidden="true" size={72} />
                <strong>WiFi QR Ready</strong>
                <span>Generated from encrypted SSID access data</span>
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

function ConnectionTestModal({ open, record, onOpenChange }: ReadonlyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="wifi-test-dialog">
        <DialogHeader>
          <DialogTitle>Connection Test</DialogTitle>
          <DialogDescription>
            Ping and monitoring hooks are ready for real-time backend integration.
          </DialogDescription>
        </DialogHeader>
        {record ? (
          <div className="connection-test-panel">
            <span className="connection-test-icon">
              <RadioTower aria-hidden="true" size={24} />
            </span>
            <div>
              <p className="connection-test-title">{record.ssidName}</p>
              <p className="connection-test-copy">
                Testing {record.deviceIp} through {record.connectionType} at {record.location}.
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

function ImportExcelModal({
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
            Upload an XLSX inventory export with duplicate IP and duplicate SSID checks
            before commit.
          </DialogDescription>
        </DialogHeader>
        <ImportExcelDropzone
          description="Supported columns match the WiFi Data form fields."
          title="Drop WiFi inventory workbook here"
        />
      </DialogContent>
    </Dialog>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <span className="field-error">{message}</span>
}

export {
  ConnectionTestModal,
  ImportExcelModal,
  ViewNetworkDetailsModal,
  WifiDataFormModal,
}

