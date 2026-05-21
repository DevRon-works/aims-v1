import {
  AlertTriangle,
  Banknote,
  Building2,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  MailWarning,
  Plus,
  Search,
  ShieldCheck,
  Store,
} from '../lib/icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { useAuth } from '../contexts/AuthContext.jsx'
import {
  AccountFormModal,
  AccountHistoryModal,
  AccountImportExcelModal,
  ViewAccountDetailsModal,
} from '../features/accounts/AccountsModals'
import { AccountsTable } from '../features/accounts/AccountsTable'
import {
  deleteAccountRecord,
  fetchAccountRows,
  accountBranchOptions,
  bankOptions,
  companyOptions,
  linkDepartmentOptions,
  type AccountRecord,
} from '../features/accounts/accountsData'
import { accountStatusOptions, linkAccountStatusOptions } from '../features/accounts/accountsSchema'

const summaryCards = [
  ['Total Store Accounts', 'store', Store],
  ['Total PLDT Accounts', 'pldt', Building2],
  ['Link Accounts', 'links', ExternalLink],
  ['Active Accounts', 'active', ShieldCheck],
  ['Missing Links', 'missingLinks', MailWarning],
  ['Invalid URLs', 'invalidUrls', AlertTriangle],
] as const

function AccountsPage() {
  const { can, user } = useAuth() as {
    can: (resource: string, action: string) => boolean
    user: { role?: string } | null
  }
  const [activeSection, setActiveSection] = useState<'Store Account' | 'PLDT Internet' | 'Link Account'>(
    'Store Account',
  )
  const [search, setSearch] = useState('')
  const [sectionFilter, setSectionFilter] = useState('all')
  const [branch, setBranch] = useState('all')
  const [company, setCompany] = useState('all')
  const [bank, setBank] = useState('all')
  const [status, setStatus] = useState('all')
  const [missingData, setMissingData] = useState('all')
  const [accountRows, setAccountRows] = useState<AccountRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<AccountRecord | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<AccountRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeModal, setActiveModal] = useState<
    'add' | 'edit' | 'view' | 'import' | 'history' | null
  >(null)
  const canCreate = can('accounts', 'create')
  const canEdit = can('accounts', 'edit')
  const canDelete = can('accounts', 'delete')
  const isSuperAdmin = ['Super Administrator', 'Super Admin'].includes(user?.role ?? '')
  const canViewAccountNumbers = ['Administrator', 'Admin', 'Super Administrator', 'Super Admin'].includes(user?.role ?? '')

  const loadAccounts = useCallback(async (options?: { preserveSelection?: boolean }) => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const rows = await fetchAccountRows()
      setAccountRows(rows)
      setSelectedRecord((current) =>
        options?.preserveSelection && current && rows.some((row) => row.id === current.id)
          ? current
          : null,
      )
    } catch (error) {
      console.error(error)
      setAccountRows([])
      setSelectedRecord(null)
      setLoadError('Account records could not be loaded.')
      toast.error('Failed to load account records')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAccounts({ preserveSelection: true })
  }, [loadAccounts])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return accountRows.filter((row) => {
      const rowBranch =
        row.accountType === 'Store Account'
          ? row.storeLocationName
          : row.accountType === 'PLDT Internet'
            ? row.branch
            : row.department
      const matchesTab = row.accountType === activeSection
      const matchesSearch =
        query.length === 0 ||
        Object.values(row).some((value) => String(value).toLowerCase().includes(query))
      const matchesSection = sectionFilter === 'all' || row.accountType === sectionFilter
      const matchesBranch = branch === 'all' || rowBranch === branch
      const matchesCompany =
        activeSection === 'Link Account' || company === 'all' || row.company === company
      const matchesBank =
        activeSection === 'Link Account' ||
        bank === 'all' ||
        row.bank === bank ||
        (row.accountType === 'Link Account' && row.department === bank)
      const matchesStatus = status === 'all' || row.status === status
      const matchesMissing =
        missingData === 'all' ||
        (missingData === 'bank' && (!row.bank || !row.accountNumber)) ||
        (missingData === 'contact' && (!row.storeEmail || !row.storeContactNumber)) ||
        (missingData === 'duplicates' && row.duplicateAccountNumber) ||
        (missingData === 'missingLink' && row.missingLink) ||
        (missingData === 'invalidUrl' && row.invalidUrl)

      return (
        matchesTab &&
        matchesSearch &&
        matchesSection &&
        matchesBranch &&
        matchesCompany &&
        matchesBank &&
        matchesStatus &&
        matchesMissing
      )
    })
  }, [accountRows, activeSection, bank, branch, company, missingData, search, sectionFilter, status])

  const summary = useMemo(() => {
    const store = accountRows.filter((row) => row.accountType === 'Store Account').length
    const pldt = accountRows.filter((row) => row.accountType === 'PLDT Internet').length
    const links = accountRows.filter((row) => row.accountType === 'Link Account').length
    const active = accountRows.filter((row) => row.status === 'Active').length
    const missingLinks = accountRows.filter((row) => row.missingLink).length
    const invalidUrls = accountRows.filter((row) => row.invalidUrl).length

    return { store, pldt, links, active, missingLinks, invalidUrls }
  }, [accountRows])

  function openModal(type: 'edit' | 'view' | 'history', record: AccountRecord) {
    setSelectedRecord(record)
    setActiveModal(type)
  }

  async function confirmDelete() {
    if (!deleteCandidate) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteAccountRecord(deleteCandidate.id)
      toast.success('Account deleted successfully')
      setDeleteCandidate(null)
      await loadAccounts()
    } catch {
      // Shared API interceptor displays request failures.
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="wifi-page accounts-page">
      <div className="wifi-page-hero">
        <div>
          <p className="section-kicker">Administration / Accounts</p>
          <h2>Accounts</h2>
          <p>
            Manage store account information, PLDT internet account records, and
            department portal links, admin panels, social links, and online system credentials.
          </p>
        </div>
        <div className="wifi-hero-actions">
          <Badge variant="success">
            <Banknote aria-hidden="true" size={13} />
            Finance ready
          </Badge>
          <Badge variant="secondary">Masked account numbers</Badge>
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

      <div className="remote-tabs" role="tablist" aria-label="Account sections">
        {(['Store Account', 'PLDT Internet', 'Link Account'] as const).map((section) => (
          <button
            aria-selected={activeSection === section}
            className={activeSection === section ? 'remote-tab remote-tab-active' : 'remote-tab'}
            key={section}
            role="tab"
            type="button"
            onClick={() => setActiveSection(section)}
          >
            {section === 'Store Account'
              ? 'Store Accounts'
              : section === 'PLDT Internet'
                ? 'PLDT Internet Accounts'
                : 'Link Accounts'}
          </button>
        ))}
      </div>

      <Card className="wifi-toolbar-card">
        <CardContent>
          <div className="wifi-toolbar accounts-toolbar">
            <div className="wifi-search">
              <Search aria-hidden="true" className="crud-search-icon" size={17} />
              <Input
                placeholder={
                  activeSection === 'Link Account'
                    ? 'Search department, email, username, link, notes'
                    : 'Search merchant, branch, bank, account, company'
                }
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="wifi-filter-grid accounts-filter-grid">
              <Select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)}>
                <option value="all">All sections</option>
                <option value="Store Account">Store Accounts</option>
                <option value="PLDT Internet">PLDT Internet</option>
                <option value="Link Account">Link Accounts</option>
              </Select>
              <Select value={branch} onChange={(event) => setBranch(event.target.value)}>
                <option value="all">
                  {activeSection === 'Link Account' ? 'All departments' : 'All branches'}
                </option>
                {(activeSection === 'Link Account' ? linkDepartmentOptions : accountBranchOptions).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              {activeSection === 'Link Account' ? null : (
                <>
                  <Select value={company} onChange={(event) => setCompany(event.target.value)}>
                    <option value="all">All companies</option>
                    {companyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                  <Select value={bank} onChange={(event) => setBank(event.target.value)}>
                    <option value="all">All banks</option>
                    {bankOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </>
              )}
              <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">All statuses</option>
                {(activeSection === 'Link Account' ? linkAccountStatusOptions : accountStatusOptions).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select value={missingData} onChange={(event) => setMissingData(event.target.value)}>
                <option value="all">All data states</option>
                {activeSection === 'Link Account' ? (
                  <>
                    <option value="missingLink">Missing link</option>
                    <option value="invalidUrl">Invalid URL</option>
                  </>
                ) : (
                  <>
                    <option value="bank">Missing bank details</option>
                    <option value="contact">Missing contact details</option>
                    <option value="duplicates">Duplicate account #</option>
                  </>
                )}
              </Select>
            </div>
            <div className="wifi-toolbar-actions">
              <Button
                disabled={!isSuperAdmin}
                type="button"
                variant="ghost"
                onClick={() => setActiveModal('import')}
              >
                <FileSpreadsheet aria-hidden="true" size={16} />
                Import Excel
              </Button>
              <Button disabled={!isSuperAdmin} type="button" variant="ghost">
                <Download aria-hidden="true" size={16} />
                Export
              </Button>
              <Button type="button" variant="ghost" onClick={() => loadAccounts({ preserveSelection: true })}>
                Refresh
              </Button>
              <Button disabled={!canCreate} type="button" onClick={() => setActiveModal('add')}>
                <Plus aria-hidden="true" size={16} />
                {activeSection === 'Link Account' ? 'Add Link Account' : 'Add Account'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="wifi-layout-grid">
        <Card className="wifi-table-card">
          <CardHeader>
            <div>
              <p className="section-kicker">Account Records</p>
              <CardTitle>
                {activeSection === 'Store Account'
                  ? 'Store Accounts'
                  : activeSection === 'PLDT Internet'
                    ? 'PLDT Internet Accounts'
                    : 'Link Accounts'}
              </CardTitle>
            </div>
            <Badge variant="secondary">
              <Filter aria-hidden="true" size={13} />
              Missing, duplicate, and invalid URL checks
            </Badge>
          </CardHeader>
          <CardContent>
            <AccountsTable
              canDelete={canDelete}
              canEdit={canEdit}
              canViewAccountNumbers={canViewAccountNumbers}
              data={filteredRows}
              error={loadError}
              isLoading={isLoading}
              section={activeSection}
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
              <p className="section-kicker">Selected Account</p>
              <h3>
                {selectedRecord
                  ? selectedRecord.accountType === 'Store Account'
                    ? selectedRecord.merchantName
                    : selectedRecord.accountType === 'PLDT Internet'
                      ? selectedRecord.companyAccount
                      : selectedRecord.username || selectedRecord.email
                  : 'No account selected'}
              </h3>
            </div>
            {selectedRecord ? (
              <>
                <div className="wifi-detail-status">
                  <Badge variant={selectedRecord.status === 'Active' ? 'success' : 'warning'}>
                    {selectedRecord.status}
                  </Badge>
                  <span>{selectedRecord.accountType}</span>
                </div>
                <dl className="wifi-detail-list">
                  <div>
                    <dt>Branch / Location</dt>
                    <dd>
                      {selectedRecord.accountType === 'Store Account'
                        ? selectedRecord.storeLocationName
                        : selectedRecord.accountType === 'PLDT Internet'
                          ? selectedRecord.branch
                          : selectedRecord.department}
                    </dd>
                  </div>
                  <div>
                    <dt>{selectedRecord.accountType === 'Link Account' ? 'Link' : 'Account'}</dt>
                    <dd>
                      {selectedRecord.accountType === 'Link Account'
                        ? selectedRecord.link || 'Missing'
                        : selectedRecord.accountNumber || 'Missing'}
                    </dd>
                  </div>
                  <div>
                    <dt>{selectedRecord.accountType === 'Link Account' ? 'Login' : 'Owner'}</dt>
                    <dd>
                      {selectedRecord.accountType === 'Store Account'
                        ? selectedRecord.storeManager || 'Missing'
                        : selectedRecord.accountType === 'PLDT Internet'
                          ? selectedRecord.company || 'Missing'
                          : selectedRecord.username || selectedRecord.email || 'Missing'}
                    </dd>
                  </div>
                  <div>
                    <dt>Last Updated</dt>
                    <dd>
                      {selectedRecord.lastUpdated} by {selectedRecord.updatedBy}
                    </dd>
                  </div>
                </dl>
                <div className="wifi-detail-actions">
                  <Button type="button" variant="ghost" onClick={() => openModal('view', selectedRecord)}>
                    View details
                  </Button>
                  <Button type="button" onClick={() => openModal('history', selectedRecord)}>
                    History
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </aside>
      </div>

      <AccountFormModal
        defaultAccountType={activeSection}
        mode="add"
        open={activeModal === 'add'}
        onOpenChange={(open) => setActiveModal(open ? 'add' : null)}
        onSaved={() => {
          toast.success('Account created successfully')
          loadAccounts()
        }}
      />
      <AccountFormModal
        defaultAccountType={activeSection}
        mode="edit"
        open={activeModal === 'edit'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'edit' : null)}
        onSaved={() => {
          toast.success('Account updated successfully')
          loadAccounts({ preserveSelection: true })
        }}
      />
      <ViewAccountDetailsModal
        open={activeModal === 'view'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'view' : null)}
      />
      <AccountImportExcelModal
        open={activeModal === 'import'}
        onOpenChange={(open) => setActiveModal(open ? 'import' : null)}
      />
      <AccountHistoryModal
        open={activeModal === 'history'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'history' : null)}
      />
      <Dialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="wifi-test-dialog">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete the selected account record.
            </DialogDescription>
          </DialogHeader>
          {deleteCandidate ? (
            <div className="delete-confirmation-panel">
              <p>
                Delete <strong>{deleteCandidate.accountType}</strong>{' '}
                <strong>
                  {deleteCandidate.merchantName ||
                    deleteCandidate.companyAccount ||
                    deleteCandidate.username ||
                    deleteCandidate.email ||
                    deleteCandidate.id}
                </strong>
                ?
              </p>
              <div className="modal-actions">
                <Button
                  disabled={isDeleting}
                  type="button"
                  variant="ghost"
                  onClick={() => setDeleteCandidate(null)}
                >
                  Cancel
                </Button>
                <Button disabled={isDeleting} type="button" onClick={confirmDelete}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}

export { AccountsPage }
