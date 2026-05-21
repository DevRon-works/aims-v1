import {
  Download,
  FileSpreadsheet,
  Filter,
  Mail,
  MailCheck,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
} from '../lib/icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { useAuth } from '../contexts/AuthContext.jsx'
import { EmailDeleteConfirmDialog } from '../features/emails/EmailDeleteConfirmDialog'
import { EmailFormModal } from '../features/emails/EmailFormModal'
import { EmailImportModal } from '../features/emails/EmailImportModal'
import { EmailViewModal } from '../features/emails/EmailViewModal'
import { EmailsTable } from '../features/emails/EmailsTable'
import {
  deleteEmailRecord,
  exportEmailRecords,
  fetchEmailOptions,
  fetchEmailRows,
  type EmailOptions,
  type EmailAccountRecord,
} from '../features/emails/emailsData'
import {
  fetchImportStatus,
  importStatusKey,
  resetImportLock,
  type ImportStatusRecord,
} from '../services/importStatus'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'

const summaryCards = [
  ['Total Emails', 'total', Mail],
  ['Email Types', 'types', MailCheck],
  ['Used Emails', 'used', UserRound],
  ['Departments', 'departments', ShieldCheck],
] as const

function EmailsPage() {
  const { can, user } = useAuth() as {
    can: (resource: string, action: string) => boolean
    user: { role?: string } | null
  }
  const [search, setSearch] = useState('')
  const [emailsType, setEmailsType] = useState('all')
  const [department, setDepartment] = useState('all')
  const [emailRows, setEmailRows] = useState<EmailAccountRecord[]>([])
  const [emailOptions, setEmailOptions] = useState<EmailOptions>({ emailsTypes: [], departments: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<EmailAccountRecord | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<EmailAccountRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [importStatuses, setImportStatuses] = useState<Record<string, ImportStatusRecord>>({})
  const [showResetImport, setShowResetImport] = useState(false)
  const [isResettingImport, setIsResettingImport] = useState(false)
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'view' | 'import' | null>(null)

  const canView = can('emails', 'view')
  const canCreate = can('emails', 'create')
  const canUpdate = can('emails', 'update') || can('emails', 'edit')
  const canDelete = can('emails', 'delete')
  const canImport = can('emails', 'import')
  const canExport = can('emails', 'export')
  const canViewPasswords = ['Administrator', 'Admin', 'Super Administrator', 'Super Admin'].includes(user?.role ?? '')
  const isSuperAdmin = ['Super Administrator', 'Super Admin'].includes(user?.role ?? '')
  const emailImportStatus = importStatuses[importStatusKey('emails')]

  const loadImportStatuses = useCallback(async () => {
    try {
      const statuses = await fetchImportStatus('emails')
      setImportStatuses(
        Object.fromEntries(statuses.map((status) => [importStatusKey(status.module_name, status.import_type), status])),
      )
    } catch {
      // Shared API interceptor displays request failures.
    }
  }, [])

  const loadOptions = useCallback(async () => {
    if (!canView) {
      setEmailOptions({ emailsTypes: [], departments: [] })
      return
    }

    try {
      setEmailOptions(await fetchEmailOptions())
    } catch (error) {
      console.error(error)
      setEmailOptions({ emailsTypes: [], departments: [] })
    }
  }, [canView])

  const loadEmails = useCallback(async (options?: { preserveSelection?: boolean }) => {
    if (!canView) {
      setEmailRows([])
      setSelectedRecord(null)
      setLoadError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setLoadError(null)
    try {
      const rows = await fetchEmailRows({
        search,
        emailsType,
        department,
      })
      setEmailRows(rows)
      setSelectedRecord((current) =>
        options?.preserveSelection && current && rows.some((row) => row.id === current.id)
          ? current
          : null,
      )
    } catch (error) {
      console.error(error)
      setEmailRows([])
      setSelectedRecord(null)
      setLoadError('Email records could not be loaded.')
    } finally {
      setIsLoading(false)
    }
  }, [canView, department, emailsType, search])

  async function refreshEmailData(options?: { preserveSelection?: boolean }) {
    await Promise.all([
      loadEmails(options),
      loadOptions(),
    ])
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      refreshEmailData({ preserveSelection: true })
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [loadEmails, loadOptions])

  useEffect(() => {
    loadImportStatuses()
  }, [loadImportStatuses])

  const summary = useMemo(() => {
    const departments = new Set(emailRows.map((row) => row.department).filter(Boolean)).size
    const types = new Set(emailRows.map((row) => row.emailsType).filter(Boolean)).size

    return {
      total: emailRows.length,
      types,
      used: emailRows.filter((row) => row.personUsed).length,
      departments,
    }
  }, [emailRows])

  function openModal(type: 'edit' | 'view', record: EmailAccountRecord) {
    setSelectedRecord(record)
    setActiveModal(type)
  }

  async function confirmDelete() {
    if (!deleteCandidate) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteEmailRecord(deleteCandidate.id)
      toast.success('Email deleted successfully')
      setDeleteCandidate(null)
      await refreshEmailData()
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleExport(format: 'csv' | 'excel' | 'pdf') {
    try {
      await exportEmailRecords(format)
      toast.success('Email records exported successfully')
    } catch {
      // Shared API interceptor displays request failures.
    }
  }

  async function confirmResetImportLock() {
    setIsResettingImport(true)
    try {
      await resetImportLock('emails')
      toast.success('Import lock reset.')
      setShowResetImport(false)
      await loadImportStatuses()
    } catch {
      // Shared API interceptor displays request failures.
    } finally {
      setIsResettingImport(false)
    }
  }

  return (
    <section className="wifi-page emails-page">
      <div className="wifi-page-hero">
        <div>
          <p className="section-kicker">Administration / Emails</p>
          <h2>Email Management</h2>
          <p>
            Manage company email accounts, passwords, departments, purpose, and recovery verification details.
          </p>
        </div>
        <div className="wifi-hero-actions">
          <Badge variant="success">
            <MailCheck aria-hidden="true" size={13} />
            Database records only
          </Badge>
          <Badge variant="secondary">Masked sensitive notes</Badge>
        </div>
      </div>

      <div className="wifi-summary-grid">
        {summaryCards.map(([label, key, Icon]) => (
          <Card className="wifi-summary-card" key={label}>
            <CardContent>
              <span className="stat-icon">
                <Icon aria-hidden="true" size={18} />
              </span>
              <div>
                <p className="metric-label">{label}</p>
                <p className="stat-value">{summary[key]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="wifi-toolbar-card">
        <CardContent>
          <div className="wifi-toolbar emails-toolbar">
            <div className="wifi-search">
              <Search aria-hidden="true" className="crud-search-icon" size={17} />
              <Input
                placeholder="Search email type, account, department, person, purpose, recovery"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="wifi-filter-grid emails-filter-grid">
              <Select
                disabled={emailOptions.emailsTypes.length === 0}
                value={emailsType}
                onChange={(event) => setEmailsType(event.target.value)}
              >
                <option value="all">All email types</option>
                {emailOptions.emailsTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select
                disabled={emailOptions.departments.length === 0}
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
              >
                <option value="all">All departments</option>
                {emailOptions.departments.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <div className="wifi-toolbar-actions">
              {canImport ? (
                <Button type="button" variant="ghost" onClick={() => setActiveModal('import')}>
                  <FileSpreadsheet aria-hidden="true" size={16} />
                  Import Excel
                </Button>
              ) : null}
              {canExport ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost">
                      <Download aria-hidden="true" size={16} />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="row-action-menu z-50 w-36">
                    <DropdownMenuItem onClick={() => handleExport('csv')}>CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('excel')}>Excel CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('pdf')}>PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
              <Button type="button" variant="ghost" onClick={() => refreshEmailData({ preserveSelection: true })}>
                Refresh
              </Button>
              {canCreate ? (
                <Button type="button" onClick={() => setActiveModal('add')}>
                  <Plus aria-hidden="true" size={16} />
                  Add Email
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="wifi-layout-grid">
        <Card className="wifi-table-card">
          <CardHeader>
            <div>
              <p className="section-kicker">Email Records</p>
              <CardTitle>Email Management</CardTitle>
            </div>
            <Badge variant="secondary">
              <Filter aria-hidden="true" size={13} />
              Emails type and department filters
            </Badge>
          </CardHeader>
          <CardContent>
            <EmailsTable
              canDelete={canDelete}
              canEdit={canUpdate}
              canViewPasswords={canViewPasswords}
              data={canView ? emailRows : []}
              error={loadError}
              isLoading={isLoading}
              onDelete={setDeleteCandidate}
              onEdit={(record) => openModal('edit', record)}
              onSelect={setSelectedRecord}
              onView={(record) => openModal('view', record)}
            />
          </CardContent>
        </Card>

        <aside className="wifi-details-panel">
          <div className="wifi-details-panel-inner">
            <div>
              <p className="section-kicker">Selected Email</p>
              <h3>{selectedRecord?.emailAccount ?? 'No email selected'}</h3>
            </div>
            {selectedRecord ? (
              <>
                <div className="wifi-detail-status">
                  <Badge variant="secondary">{selectedRecord.emailsType}</Badge>
                  <span>{selectedRecord.department || 'No department'}</span>
                </div>
                <dl className="wifi-detail-list">
                  <div>
                    <dt>Email Account</dt>
                    <dd>{selectedRecord.emailAccount}</dd>
                  </div>
                  <div>
                    <dt>Person Used</dt>
                    <dd>{selectedRecord.personUsed || 'Missing'}</dd>
                  </div>
                  <div>
                    <dt>Recovery</dt>
                    <dd>{selectedRecord.recoveryEmail || 'Missing'} / {selectedRecord.recoveryNumberVerification || 'Missing'}</dd>
                  </div>
                  <div>
                    <dt>Purpose</dt>
                    <dd>{selectedRecord.purpose || 'Missing'}</dd>
                  </div>
                  <div>
                    <dt>Last Updated</dt>
                    <dd>{selectedRecord.updatedAt || 'Not available'} {selectedRecord.updatedBy ? `by ${selectedRecord.updatedBy}` : ''}</dd>
                  </div>
                </dl>
                <div className="wifi-detail-actions">
                  <Button type="button" variant="ghost" onClick={() => openModal('view', selectedRecord)}>
                    View details
                  </Button>
                  {canUpdate ? (
                    <Button type="button" onClick={() => openModal('edit', selectedRecord)}>
                      Edit
                    </Button>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </aside>
      </div>

      <EmailFormModal
        canViewSecret={canViewPasswords}
        mode="add"
        options={emailOptions}
        open={activeModal === 'add'}
        onOpenChange={(open) => setActiveModal(open ? 'add' : null)}
        onSaved={() => refreshEmailData()}
      />
      <EmailFormModal
        canViewSecret={canViewPasswords}
        mode="edit"
        options={emailOptions}
        open={activeModal === 'edit'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'edit' : null)}
        onSaved={() => refreshEmailData({ preserveSelection: true })}
      />
      <EmailViewModal
        canViewSecret={canViewPasswords}
        open={activeModal === 'view'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'view' : null)}
      />
      <EmailImportModal
        importStatus={emailImportStatus}
        isSuperAdmin={isSuperAdmin}
        open={activeModal === 'import'}
        onResetImportLock={() => setShowResetImport(true)}
        onImported={() => {
          loadImportStatuses()
          refreshEmailData()
        }}
        onOpenChange={(open) => setActiveModal(open ? 'import' : null)}
      />
      <EmailDeleteConfirmDialog
        isDeleting={isDeleting}
        record={deleteCandidate}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={confirmDelete}
      />
      <Dialog open={showResetImport} onOpenChange={setShowResetImport}>
        <DialogContent className="wifi-test-dialog">
          <DialogHeader>
            <DialogTitle>Reset Import Lock</DialogTitle>
            <DialogDescription>
              This allows another Email import.
            </DialogDescription>
          </DialogHeader>
          <div className="delete-confirmation-panel">
            <p>Allow re-import for <strong>Emails</strong>?</p>
            <div className="modal-actions">
              <Button disabled={isResettingImport} type="button" variant="ghost" onClick={() => setShowResetImport(false)}>
                Cancel
              </Button>
              <Button disabled={isResettingImport} type="button" onClick={confirmResetImportLock}>
                {isResettingImport ? 'Resetting...' : 'Reset Import Lock'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export { EmailsPage }
