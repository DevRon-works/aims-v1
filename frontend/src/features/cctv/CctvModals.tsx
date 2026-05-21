import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, RadioTower, Save } from '../../lib/icons'
import { useEffect, useState } from 'react'
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
import { ImportExcelDropzone } from '../../components/import/ImportExcelDropzone'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { normalizeApiError } from '../../lib/apiErrors'
import {
  cctvBranches,
  cctvBrands,
  cctvFloors,
  createCctvRecord,
  getDefaultCctvFormValues,
  importCctvRecords,
  updateCctvRecord,
  type CctvImportSummary,
  type CctvRecord,
  type CctvSection,
} from './cctvData'
import {
  importStatusKey,
  type ImportStatusRecord,
} from '../../services/importStatus'
import {
  cctvRecordSchema,
  cctvStatusOptions,
  cctvTypeOptions,
  type CctvFormValues,
} from './cctvSchema'

type FormModalProps = {
  mode: 'add' | 'edit'
  open: boolean
  defaultSection?: CctvSection
  record?: CctvRecord | null
  onOpenChange: (open: boolean) => void
  onSaved?: (record: CctvRecord) => void
}

type ReadonlyModalProps = {
  open: boolean
  record: CctvRecord | null
  onOpenChange: (open: boolean) => void
}

type FieldConfig = {
  label: string
  name: keyof CctvFormValues
  type?: 'password' | 'select' | 'textarea'
  options?: string[]
}

const sectionFields: Record<CctvSection, FieldConfig[]> = {
  'Avada Center': [
    { label: 'Floor Name', name: 'floorName', type: 'select', options: cctvFloors },
    { label: 'Camera #', name: 'cameraNumber' },
    { label: 'Camera Name', name: 'cameraName' },
    { label: 'Username', name: 'username' },
    { label: 'Password', name: 'password', type: 'password' },
    { label: 'NVR IP', name: 'nvrIp' },
    { label: 'Camera IP', name: 'cameraIp' },
    { label: 'Status', name: 'status', type: 'select', options: [...cctvStatusOptions] },
    { label: 'Notes', name: 'notes', type: 'textarea' },
  ],
  Boutique: [
    { label: 'Branch', name: 'branch', type: 'select', options: cctvBranches },
    { label: 'Brand', name: 'brand', type: 'select', options: cctvBrands },
    { label: 'Working Cameras', name: 'workingCameras' },
    { label: 'Serial', name: 'serial' },
    { label: 'Username', name: 'username' },
    { label: 'Password', name: 'password', type: 'password' },
    { label: 'Web IP', name: 'webIp' },
    { label: 'Storage', name: 'storage' },
    { label: 'Status', name: 'status', type: 'select', options: [...cctvStatusOptions] },
    { label: 'Notes', name: 'notes', type: 'textarea' },
  ],
  'Warehouse / Online': [
    { label: 'Branch', name: 'branch', type: 'select', options: cctvBranches },
    { label: 'Brand', name: 'brand', type: 'select', options: cctvBrands },
    { label: 'Model', name: 'model' },
    { label: 'Serial', name: 'serial' },
    { label: 'Username', name: 'username' },
    { label: 'Password', name: 'password', type: 'password' },
    { label: 'Web IP', name: 'webIp' },
    { label: 'Storage', name: 'storage' },
    { label: 'Status', name: 'status', type: 'select', options: [...cctvStatusOptions] },
    { label: 'Notes', name: 'notes', type: 'textarea' },
  ],
}

function CctvFormModal({
  mode,
  open,
  defaultSection = 'Avada Center',
  record,
  onOpenChange,
  onSaved,
}: FormModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const form = useForm<CctvFormValues>({
    resolver: zodResolver(cctvRecordSchema),
    defaultValues: record ?? getDefaultCctvFormValues(defaultSection),
  })
  const selectedType = (form.watch('type') || defaultSection) as CctvSection
  const visibleFields = sectionFields[selectedType] ?? sectionFields[defaultSection]

  useEffect(() => {
    form.reset(record ?? getDefaultCctvFormValues(defaultSection))
  }, [defaultSection, form, open, record])

  async function handleSubmit(values: CctvFormValues) {
    const parsedValues = cctvRecordSchema.parse(values)
    const section = (record?.type ?? parsedValues.type ?? defaultSection) as CctvSection

    setIsSaving(true)
    try {
      const savedRecord =
        mode === 'edit' && record
          ? await updateCctvRecord(section, record.id, parsedValues)
          : await createCctvRecord(section, parsedValues)

      onSaved?.(savedRecord)
      onOpenChange(false)
    } catch {
      // Shared API interceptor displays request failures.
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cctv-dialog">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add CCTV Record' : 'Edit CCTV Record'}</DialogTitle>
          <DialogDescription>
            Maintain CCTV camera, DVR/NVR, credential, IP, serial, and web access details
            with validation and audit-ready fields.
          </DialogDescription>
        </DialogHeader>

        <form className="wifi-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="wifi-form-grid">
            <label className="field-group">
              <span className="label">CCTV Type</span>
              <Select {...form.register('type')}>
                {cctvTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            {visibleFields.map((field) => (
              <CctvField form={form} field={field} key={field.name} />
            ))}
          </div>

          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={isSaving} type="submit">
              <Save aria-hidden="true" size={16} />
              {isSaving ? 'Saving...' : 'Save CCTV Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ViewCctvDetailsModal({ open, record, onOpenChange }: ReadonlyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cctv-details-dialog">
        <DialogHeader>
          <DialogTitle>View CCTV Details</DialogTitle>
          <DialogDescription>
            Review access credentials, camera identity, duplicate IP flags, and audit logs.
          </DialogDescription>
        </DialogHeader>
        {record ? (
          <div className="network-detail-grid">
            <div className="network-detail-main">
              {[
                ['Type', record.type],
                ['Floor / Branch', record.type === 'Avada Center' ? record.floorName : record.branch],
                ['Camera / Device', record.type === 'Avada Center' ? record.cameraName : record.model],
                ['Brand', record.brand || 'Not set'],
                ['Serial', record.serial || 'Not set'],
                ['Username', record.username || 'Missing'],
                ['NVR / Web IP', record.type === 'Avada Center' ? record.nvrIp : record.webIp],
                ['Camera IP', record.cameraIp || 'Not applicable'],
                ['Status', record.status],
                ['Updated By', record.updatedBy],
              ].map(([label, value]) => (
                <div className="detail-field" key={label}>
                  <span>{label}</span>
                  <strong>{value || 'Not set'}</strong>
                </div>
              ))}
            </div>
          <div className="network-detail-side">
            <div className="qr-preview">
              <Camera aria-hidden="true" size={58} />
              <strong>CCTV Access Record</strong>
              <span>
                  {!record.username || !record.password
                    ? 'Missing credentials require admin update'
                    : 'Credentials available by assigned role'}
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

function CctvConnectionTestModal({ open, record, onOpenChange }: ReadonlyModalProps) {
  const targetIp =
    record?.type === 'Avada Center' ? record.cameraIp || record.nvrIp : record?.webIp

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="wifi-test-dialog">
        <DialogHeader>
          <DialogTitle>Connection Test</DialogTitle>
          <DialogDescription>
            Ping checks are ready to connect to CCTV monitoring jobs and IP diagnostics.
          </DialogDescription>
        </DialogHeader>
        {record ? (
          <div className="connection-test-panel">
            <span className="connection-test-icon">
              <RadioTower aria-hidden="true" size={24} />
            </span>
            <div>
              <p className="connection-test-title">
                {record.type === 'Avada Center' ? record.cameraName : record.branch}
              </p>
              <p className="connection-test-copy">
                Testing {targetIp || 'unassigned IP'} for {record.type}.
              </p>
            </div>
            <Badge variant={record.status === 'Online' ? 'success' : 'warning'}>
              {record.status === 'Online' ? 'Reachable' : 'Needs review'}
            </Badge>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function CctvImportExcelModal({
  open,
  onOpenChange,
  onImported,
  importStatuses = {},
  isSuperAdmin = false,
  onResetImportLock,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported?: (section: CctvSection) => void
  importStatuses?: Record<string, ImportStatusRecord>
  isSuperAdmin?: boolean
  onResetImportLock?: (section: CctvSection) => void
}) {
  const [selectedSection, setSelectedSection] = useState<CctvSection | ''>('')
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [summary, setSummary] = useState<CctvImportSummary | null>(null)
  const selectedImportStatus = selectedSection
    ? importStatuses[importStatusKey('cctv', selectedSection)]
    : null
  const isLocked = Boolean(selectedImportStatus?.locked)

  function resetImport() {
    setSelectedSection('')
    setFile(null)
    setSummary(null)
  }

  async function submitImport() {
    if (!selectedSection) {
      setSummary(null)
      toast.error('Select a CCTV Type before importing a file.')
      return
    }

    if (isLocked) {
      toast.info('Import already completed for this section.')
      return
    }

    if (!file) {
      return
    }

    setIsImporting(true)
    try {
      const result = await importCctvRecords(selectedSection, file)
      setSummary(result)
      onImported?.(selectedSection)
    } catch (error) {
      const normalizedError = normalizeApiError(error)
      const responseSummary = normalizedError?.response?.data

      if (responseSummary && typeof responseSummary === 'object') {
        setSummary({
          total_rows: responseSummary.total_rows ?? 0,
          imported_rows: responseSummary.imported_rows ?? 0,
          skipped_duplicate_rows: responseSummary.skipped_duplicate_rows ?? 0,
          updated_rows: responseSummary.updated_rows ?? 0,
          failed_rows: responseSummary.failed_rows ?? 0,
          validation_errors: responseSummary.validation_errors ?? [],
          rolled_back: responseSummary.rolled_back,
          cctv_type: responseSummary.cctv_type,
          message: responseSummary.message,
        })
      }
    } finally {
      setIsImporting(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isImporting) {
      resetImport()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="premium-import-dialog">
        <DialogHeader>
          <DialogTitle>Import Excel</DialogTitle>
          <DialogDescription>
            Select the CCTV type before uploading. The selected type controls the
            required columns, validation rules, and backend import table.
          </DialogDescription>
        </DialogHeader>
        <label className="field-group">
          <span className="label">CCTV Type</span>
          <Select
            disabled={isImporting}
            value={selectedSection}
            onChange={(event) => {
              setSummary(null)
              setSelectedSection(event.target.value as CctvSection | '')
            }}
          >
            <option value="">Select CCTV type</option>
            {cctvTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
        {!selectedSection ? (
          <p className="field-error">Select a CCTV Type before importing a file.</p>
        ) : null}
        {selectedSection ? <ImportColumnGuide section={selectedSection} /> : null}
        {isLocked ? (
          <div className="cctv-import-lock-panel">
            <strong>Import already completed for this section.</strong>
            <span>
              {selectedImportStatus?.file_name || 'Previous import'} completed
              {selectedImportStatus?.imported_at ? ` on ${selectedImportStatus.imported_at}` : ''}.
            </span>
            <span>
              Imported rows: {selectedImportStatus?.imported_rows ?? 0} / Failed rows:{' '}
              {selectedImportStatus?.failed_rows ?? 0}
            </span>
            {isSuperAdmin && selectedSection ? (
              <Button type="button" variant="ghost" onClick={() => onResetImportLock?.(selectedSection)}>
                Reset Import Lock
              </Button>
            ) : null}
          </div>
        ) : null}
        <ImportExcelDropzone
          description={
            selectedSection
              ? `Drop your ${selectedSection} workbook here or browse from your device.`
              : 'Choose a CCTV Type first, then select an Excel or CSV file.'
          }
          file={file}
          isImporting={isImporting}
          isLocked={isLocked}
          lockedMessage="Import already completed for this section."
          title="Drop Excel or CSV file here"
          onClear={resetImport}
          onImport={submitImport}
          onSelectFile={(nextFile) => {
            setSummary(null)
            setFile(nextFile)
          }}
        />
        {isImporting ? (
          <div className="cctv-import-progress" aria-live="polite">
            <span />
            <span />
            <span />
          </div>
        ) : null}
        {summary ? <CctvImportSummaryPanel summary={summary} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function ImportColumnGuide({ section }: { section: CctvSection }) {
  const columns: Record<CctvSection, string[]> = {
    'Avada Center': [
      'Floor Name',
      'Camera #',
      'Camera Name',
      'Username',
      'Password',
      'NVR IP',
      'Camera IP',
    ],
    Boutique: [
      'Branch',
      'Brand',
      'Working Cameras',
      'Serial',
      'Username',
      'Password',
      'Web IP',
      'Storage',
    ],
    'Warehouse / Online': [
      'Branch',
      'Brand',
      'Model',
      'Serial',
      'Username',
      'Password',
      'Web IP',
      'Storage',
    ],
  }

  return (
    <div className="cctv-import-columns">
      <strong>Required columns</strong>
      <span>{columns[section].join(', ')}</span>
      <small>Optional columns: Status, Notes. Missing Status defaults to Online.</small>
    </div>
  )
}

function CctvField({
  field,
  form,
}: {
  field: FieldConfig
  form: ReturnType<typeof useForm<CctvFormValues>>
}) {
  const error = form.formState.errors[field.name]?.message

  if (field.type === 'textarea') {
    return (
      <label className="field-group wifi-form-notes">
        <span className="label">{field.label}</span>
        <Textarea rows={3} {...form.register(field.name)} />
        <FieldError message={error} />
      </label>
    )
  }

  if (field.type === 'select') {
    return (
      <label className="field-group">
        <span className="label">{field.label}</span>
        <Select aria-invalid={Boolean(error)} {...form.register(field.name)}>
          <option value="">Select {field.label.toLowerCase()}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <FieldError message={error} />
      </label>
    )
  }

  return (
    <label className="field-group">
      <span className="label">{field.label}</span>
      <Input
        aria-invalid={Boolean(error)}
        type={field.type === 'password' ? 'password' : 'text'}
        {...form.register(field.name)}
      />
      <FieldError message={error} />
    </label>
  )
}

function CctvImportSummaryPanel({ summary }: { summary: CctvImportSummary }) {
  return (
    <div className="email-import-summary">
      <div className="email-import-summary-grid">
        <SummaryItem label="Total rows" value={summary.total_rows} />
        <SummaryItem label="Imported" value={summary.imported_rows} />
        <SummaryItem label="Skipped duplicates" value={summary.skipped_duplicate_rows} />
        <SummaryItem label="Updated" value={summary.updated_rows} />
        <SummaryItem label="Failed" value={summary.failed_rows} />
        <SummaryItem label="Rolled back" value={summary.rolled_back ? 1 : 0} />
      </div>

      {summary.validation_errors.length > 0 ? (
        <div className="email-import-errors">
          <strong>Validation errors</strong>
          <div className="wifi-table-shell email-import-error-table">
            <Table className="wifi-data-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Column</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.validation_errors.map((error, index) => (
                  <TableRow key={`${error.row}-${error.column ?? 'row'}-${index}`}>
                    <TableCell>{error.row}</TableCell>
                    <TableCell>{error.column || 'row'}</TableCell>
                    <TableCell>{error.reason || error.errors.join(', ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="email-import-summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="field-error">{message}</span> : null
}

export {
  CctvConnectionTestModal,
  CctvFormModal,
  CctvImportExcelModal,
  ViewCctvDetailsModal,
}
