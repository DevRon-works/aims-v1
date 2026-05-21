import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Camera,
  CameraOff,
  Download,
  Eye,
  FileSpreadsheet,
  Pencil,
  Plus,
  RadioTower,
  RotateCcw,
  Search,
  ShieldCheck,
} from '../lib/icons'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useAuth } from '../contexts/AuthContext.jsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import {
  CctvFormModal,
  CctvImportExcelModal,
  ViewCctvDetailsModal,
} from '../features/cctv/CctvModals'
import { CctvTable } from '../features/cctv/CctvTable'
import {
  deleteCctvRecord,
  exportCctvRecords,
  fetchCctvRows,
  viewCctvRecord,
  type CctvExportFormat,
  type CctvExportScope,
  type CctvPaginationMeta,
  type CctvRecord,
  type CctvSection,
} from '../features/cctv/cctvData'
import {
  fetchImportStatus,
  importStatusKey,
  resetImportLock,
  type ImportStatusRecord,
} from '../services/importStatus'

const sections: CctvSection[] = ['Avada Center', 'Boutique', 'Warehouse / Online']
const pageSize = 5

const emptyMeta: CctvPaginationMeta = {
  currentPage: 1,
  lastPage: 1,
  perPage: pageSize,
  total: 0,
  from: null,
  to: null,
}

const sectionDescriptions: Record<CctvSection, string> = {
  'Avada Center': 'Floor-level IP camera access and NVR mapping for headquarters.',
  Boutique: 'Branch recorder health, working camera counts, web access, and storage.',
  'Warehouse / Online': 'Warehouse and fulfillment CCTV recorder inventory.',
}

type SectionCache = {
  rows: CctvRecord[]
  pagination: CctvPaginationMeta
  search: string
  page: number
  error: string | null
  loaded: boolean
}

const initialCache = sections.reduce(
  (cache, section) => ({
    ...cache,
    [section]: {
      rows: [],
      pagination: emptyMeta,
      search: '',
      page: 1,
      error: null,
      loaded: false,
    },
  }),
  {} as Record<CctvSection, SectionCache>,
)

function CctvPage() {
  const { user } = useAuth() as { user: { role?: string } | null }
  const [activeSection, setActiveSection] = useState<CctvSection>('Avada Center')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [cache, setCache] = useState<Record<CctvSection, SectionCache>>(initialCache)
  const [displaySection, setDisplaySection] = useState<CctvSection>('Avada Center')
  const [loadingSection, setLoadingSection] = useState<CctvSection | null>('Avada Center')
  const [selectedRecord, setSelectedRecord] = useState<CctvRecord | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<CctvRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importStatuses, setImportStatuses] = useState<Record<string, ImportStatusRecord>>({})
  const [resetCandidate, setResetCandidate] = useState<CctvSection | null>(null)
  const [isResettingImport, setIsResettingImport] = useState(false)
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'view' | 'import' | null>(null)
  const [actionNotice, setActionNotice] = useState('Monitoring console ready')
  const activeCache = cache[activeSection]
  const displayCache = cache[displaySection]
  const isFetchingActive = loadingSection === activeSection
  const tableIsUpdating = Boolean(loadingSection)
  const isSuperAdmin = ['Super Administrator', 'Super Admin'].includes(user?.role ?? '')

  const loadImportStatuses = useCallback(async () => {
    try {
      const statuses = await fetchImportStatus('cctv')
      setImportStatuses(
        Object.fromEntries(statuses.map((status) => [importStatusKey(status.module_name, status.import_type), status])),
      )
    } catch {
      // Shared API interceptor displays request failures.
    }
  }, [])

  const loadCctvRows = useCallback(async (force = false) => {
    const requestSection = activeSection
    const requestPage = page
    const requestSearch = search
    const cached = cache[requestSection]

    if (
      !force &&
      cached.loaded &&
      cached.page === requestPage &&
      cached.search === requestSearch
    ) {
      setDisplaySection(requestSection)
      return
    }

    setLoadingSection(requestSection)

    try {
      const result = await fetchCctvRows({
        page: requestPage,
        perPage: pageSize,
        search: requestSearch,
        section: requestSection,
      })

      setCache((current) => ({
        ...current,
        [requestSection]: {
          rows: result.data,
          pagination: result.meta,
          search: requestSearch,
          page: requestPage,
          error: null,
          loaded: true,
        },
      }))
      setDisplaySection(requestSection)
    } catch {
      setCache((current) => ({
        ...current,
        [requestSection]: {
          ...current[requestSection],
          error: 'CCTV records could not be loaded.',
          search: requestSearch,
          page: requestPage,
          loaded: current[requestSection].loaded,
        },
      }))
    } finally {
      setLoadingSection((current) => (current === requestSection ? null : current))
    }
  }, [activeSection, cache, page, search])

  useEffect(() => {
    loadCctvRows()
  }, [loadCctvRows])

  useEffect(() => {
    loadImportStatuses()
  }, [loadImportStatuses])

  function handleSectionChange(section: CctvSection) {
    setActiveSection(section)
    const nextCache = cache[section]
    setPage(nextCache.loaded && nextCache.search === search ? nextCache.page : 1)

    if (nextCache.loaded && nextCache.search === search) {
      setDisplaySection(section)
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  const summary = useMemo(() => {
    const online = activeCache.rows.filter((row) => row.status === 'Online').length
    const offline = activeCache.rows.filter((row) => row.status === 'Offline').length

    return { total: activeCache.pagination.total, online, offline }
  }, [activeCache])

  async function openRecordModal(type: 'edit' | 'view', record: CctvRecord) {
    setSelectedRecord(record)
    setActiveModal(type)

    try {
      const freshRecord = await viewCctvRecord(record.type, record.id)
      setSelectedRecord(freshRecord)
    } catch {
      // Shared API interceptor displays request failures.
    }
  }

  async function confirmDelete() {
    if (!deleteCandidate) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteCctvRecord(deleteCandidate.type, deleteCandidate.id)
      toast.success('CCTV record deleted successfully')
      setDeleteCandidate(null)
      setCache((current) => ({
        ...current,
        [deleteCandidate.type]: {
          ...current[deleteCandidate.type],
          loaded: false,
        },
      }))
      await loadCctvRows(true)
    } catch {
      // Shared API interceptor displays request failures.
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleExport(scope: CctvExportScope, format: CctvExportFormat) {
    setIsExporting(true)
    try {
      await exportCctvRecords({
        format,
        page,
        perPage: pageSize,
        scope,
        search,
        section: activeSection,
      })
      toast.success('CCTV export prepared successfully')
    } catch {
      // Shared API interceptor displays request failures.
    } finally {
      setIsExporting(false)
    }
  }

  async function confirmResetImportLock() {
    if (!resetCandidate) {
      return
    }

    setIsResettingImport(true)
    try {
      await resetImportLock('cctv', resetCandidate)
      toast.success('Import lock reset.')
      setResetCandidate(null)
      await loadImportStatuses()
    } catch {
      // Shared API interceptor displays request failures.
    } finally {
      setIsResettingImport(false)
    }
  }

  function handleAction(action: string, record: CctvRecord) {
    const name =
      record.type === 'Avada Center'
        ? `${record.cameraNumber} ${record.cameraName}`
        : `${record.branch} ${record.brand}`

    setActionNotice(`${action}: ${name}`)
  }

  return (
    <section className="cctv-enterprise-page">
      <div className="cctv-enterprise-header">
        <div>
          <p className="section-kicker">IT Department / CCTV Management</p>
          <h2>CCTV Management</h2>
          <p>
            Centralized monitoring inventory for camera credentials, recorder access,
            branch status, and storage coverage.
          </p>
        </div>
        <div className="cctv-health-strip">
          <Badge variant="secondary">
            <Camera aria-hidden="true" size={13} />
            {summary.total} Devices
          </Badge>
          <Badge variant="success">
            <ShieldCheck aria-hidden="true" size={13} />
            {summary.online} Online
          </Badge>
          <Badge variant="destructive">
            <CameraOff aria-hidden="true" size={13} />
            {summary.offline} Offline
          </Badge>
        </div>
      </div>

      <Tabs
        className="cctv-tabs"
        value={activeSection}
        onValueChange={(value) => handleSectionChange(value as CctvSection)}
      >
        <div className="cctv-controls-row">
          <TabsList className="cctv-tabs-list" aria-label="CCTV sections">
            {sections.map((section) => (
              <TabsTrigger className="cctv-tabs-trigger" key={section} value={section}>
                {section}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="cctv-search">
            <Search aria-hidden="true" className="crud-search-icon" size={17} />
            <Input
              placeholder="Search branch, camera, serial, IP, username"
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>
        </div>

        <Card className="cctv-console-card">
          <CardHeader>
            <div>
              <p className="section-kicker">Live Inventory</p>
              <CardTitle>{activeSection}</CardTitle>
              <p className="cctv-section-description">{sectionDescriptions[activeSection]}</p>
            </div>
            <div className="cctv-console-actions">
              {tableIsUpdating ? (
                <Badge className="cctv-inline-loading" variant="secondary">
                  Loading {loadingSection}
                </Badge>
              ) : null}
              <Badge variant="secondary">{actionNotice}</Badge>
              <Button type="button" variant="ghost" onClick={() => setActiveModal('import')}>
                <FileSpreadsheet aria-hidden="true" size={16} />
                Import Excel
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger className="button button-ghost button-size-default">
                  <Download aria-hidden="true" size={16} />
                  {isExporting ? 'Exporting...' : 'Export'}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="row-action-menu">
                  <DropdownMenuItem disabled={isExporting} onClick={() => handleExport('current', 'xlsx')}>
                    Export Current Table - Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={isExporting} onClick={() => handleExport('current', 'csv')}>
                    Export Current Table - CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={isExporting} onClick={() => handleExport('filtered', 'xlsx')}>
                    Export Filtered Results - Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={isExporting} onClick={() => handleExport('filtered', 'csv')}>
                    Export Filtered Results - CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={isExporting} onClick={() => handleExport('all', 'xlsx')}>
                    Export All - Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={isExporting} onClick={() => handleExport('all', 'csv')}>
                    Export All - CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button type="button" variant="ghost" onClick={() => setActiveModal('add')}>
                <Plus aria-hidden="true" size={16} />
                Add Record
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setActionNotice(`Ping sweep queued for ${activeSection}`)}
              >
                <RadioTower aria-hidden="true" size={16} />
                Ping Sweep
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="cctv-tab-panel">
              <CctvTable
                canEdit
                canViewPasswords
                data={displayCache.rows}
                error={displayCache.error}
                isLoading={isFetchingActive || isExporting}
                pagination={displayCache.pagination}
                section={displaySection}
                onDelete={setDeleteCandidate}
                onEdit={(record) => openRecordModal('edit', record)}
                onPageChange={setPage}
                onPing={(record) => handleAction('Ping Camera', record)}
                onRestart={(record) => handleAction('Restart', record)}
                onView={(record) => openRecordModal('view', record)}
              />
            </div>
          </CardContent>
        </Card>
      </Tabs>

      <div className="cctv-quick-actions" aria-label="CCTV action legend">
        {[
          ['View', Eye],
          ['Edit', Pencil],
          ['Ping Camera', RadioTower],
          ['Open Web UI', Camera],
          ['Restart', RotateCcw],
        ].map(([label, Icon]) => (
          <span key={label as string}>
            <Icon aria-hidden="true" size={14} />
            {label as string}
          </span>
        ))}
      </div>

      <CctvFormModal
        defaultSection={activeSection}
        mode="add"
        open={activeModal === 'add'}
        onOpenChange={(open) => setActiveModal(open ? 'add' : null)}
        onSaved={() => {
          toast.success('CCTV record created successfully')
          setCache((current) => ({
            ...current,
            [activeSection]: {
              ...current[activeSection],
              loaded: false,
            },
          }))
          loadCctvRows(true)
        }}
      />
      <CctvFormModal
        defaultSection={activeSection}
        mode="edit"
        open={activeModal === 'edit'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'edit' : null)}
        onSaved={() => {
          toast.success('CCTV record updated successfully')
          setCache((current) => ({
            ...current,
            [activeSection]: {
              ...current[activeSection],
              loaded: false,
            },
          }))
          loadCctvRows(true)
        }}
      />
      <ViewCctvDetailsModal
        open={activeModal === 'view'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'view' : null)}
      />
      <CctvImportExcelModal
        importStatuses={importStatuses}
        isSuperAdmin={isSuperAdmin}
        open={activeModal === 'import'}
        onResetImportLock={setResetCandidate}
        onImported={(importedSection) => {
          toast.success('CCTV import completed successfully')
          loadImportStatuses()
          setCache((current) => ({
            ...current,
            [importedSection]: {
              ...current[importedSection],
              loaded: false,
            },
          }))
          if (importedSection === activeSection) {
            loadCctvRows(true)
          }
        }}
        onOpenChange={(open) => setActiveModal(open ? 'import' : null)}
      />
      <Dialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="wifi-test-dialog">
          <DialogHeader>
            <DialogTitle>Delete CCTV Record</DialogTitle>
            <DialogDescription>
              This will permanently delete the selected CCTV record from the backend.
            </DialogDescription>
          </DialogHeader>
          {deleteCandidate ? (
            <div className="delete-confirmation-panel">
              <p>
                Delete{' '}
                <strong>
                  {deleteCandidate.cameraName ||
                    deleteCandidate.branch ||
                    deleteCandidate.serial ||
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
      <Dialog open={Boolean(resetCandidate)} onOpenChange={(open) => !open && setResetCandidate(null)}>
        <DialogContent className="wifi-test-dialog">
          <DialogHeader>
            <DialogTitle>Reset Import Lock</DialogTitle>
            <DialogDescription>
              This allows another import for the selected CCTV section.
            </DialogDescription>
          </DialogHeader>
          <div className="delete-confirmation-panel">
            <p>
              Allow re-import for <strong>{resetCandidate}</strong>?
            </p>
            <div className="modal-actions">
              <Button
                disabled={isResettingImport}
                type="button"
                variant="ghost"
                onClick={() => setResetCandidate(null)}
              >
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

export { CctvPage }
