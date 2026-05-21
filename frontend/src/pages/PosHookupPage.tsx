import {
  AlertTriangle,
  Database,
  Download,
  FileSpreadsheet,
  Filter,
  MapPin,
  Network,
  Plus,
  RadioTower,
  Search,
  ShieldCheck,
  Store,
} from '../lib/icons'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { useAuth } from '../contexts/AuthContext.jsx'
import {
  PosConnectionTestModal,
  PosHookupFormModal,
  PosImportExcelModal,
  ViewPosDetailsModal,
} from '../features/pos-hookup/PosHookupModals'
import { PosHookupTable } from '../features/pos-hookup/PosHookupTable'
import {
  mallServerOptions,
  posBranchOptions,
  fetchPosHookupRows,
  type PosHookupRecord,
} from '../features/pos-hookup/posHookupData'
import { posStatusOptions } from '../features/pos-hookup/posHookupSchema'

const summaryCards = [
  ['Total Branches', 'branches', Store],
  ['Active POS Hookups', 'active', Network],
  ['Missing IP Details', 'missingIp', AlertTriangle],
  ['Missing Sales Path', 'missingSalesPath', Database],
  ['Duplicate IP Detected', 'duplicates', ShieldCheck],
  ['Recently Updated', 'recent', MapPin],
] as const

function PosHookupPage() {
  const { can, user } = useAuth() as {
    can: (resource: string, action: string) => boolean
    user: { role?: string } | null
  }
  const [search, setSearch] = useState('')
  const [branch, setBranch] = useState('all')
  const [status, setStatus] = useState('all')
  const [mallServerIp, setMallServerIp] = useState('all')
  const [missingData, setMissingData] = useState('all')
  const [posRows, setPosRows] = useState<PosHookupRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<PosHookupRecord | null>(null)
  const [activeModal, setActiveModal] = useState<
    'add' | 'edit' | 'view' | 'import' | 'test' | null
  >(null)
  const canCreate = can('pos-hookup', 'create')
  const canEdit = can('pos-hookup', 'edit')
  const canDelete = can('pos-hookup', 'delete')
  const isSuperAdmin = user?.role === 'Super Admin'
  const canViewPasswords = ['Admin', 'Super Admin'].includes(user?.role ?? '')

  useEffect(() => {
    fetchPosHookupRows()
      .then((rows) => {
        setPosRows(rows)
        setSelectedRecord(rows[0] ?? null)
      })
      .catch(() => {
        setPosRows([])
        setSelectedRecord(null)
      })
  }, [])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return posRows.filter((row) => {
      const matchesSearch =
        query.length === 0 ||
        Object.values(row).some((value) => String(value).toLowerCase().includes(query))
      const matchesBranch = branch === 'all' || row.branch === branch
      const matchesStatus = status === 'all' || row.status === status
      const matchesServer = mallServerIp === 'all' || row.mallServerIp === mallServerIp
      const matchesMissing =
        missingData === 'all' ||
        (missingData === 'ip' &&
          (!row.ipAddress || !row.gateway || !row.subnetMask || !row.mallServerIp)) ||
        (missingData === 'salesPath' && !row.salesPath) ||
        (missingData === 'credentials' && !row.ssidUsername)

      return matchesSearch && matchesBranch && matchesStatus && matchesServer && matchesMissing
    })
  }, [branch, mallServerIp, missingData, posRows, search, status])

  const summary = useMemo(() => {
    const branches = new Set(posRows.map((row) => row.branch)).size
    const active = posRows.filter((row) => row.status === 'Active').length
    const missingIp = posRows.filter(
      (row) => !row.ipAddress || !row.gateway || !row.subnetMask || !row.mallServerIp,
    ).length
    const missingSalesPath = posRows.filter((row) => !row.salesPath).length
    const duplicates = posRows.filter((row) => row.duplicateIp).length
    const recent = posRows.filter((row) => row.lastUpdated.includes('Today')).length

    return { branches, active, missingIp, missingSalesPath, duplicates, recent }
  }, [posRows])

  function openModal(type: 'edit' | 'view' | 'test', record: PosHookupRecord) {
    setSelectedRecord(record)
    setActiveModal(type)
  }

  return (
    <section className="wifi-page pos-page">
      <div className="wifi-page-hero">
        <div>
          <p className="section-kicker">Network Management / POS Hookup</p>
          <h2>POS Hookup</h2>
          <p>
            Manage and monitor POS network hookup details per branch, including
            contract number, POS code, IP settings, mall server IP, WiFi/login
            credentials, and sales path.
          </p>
        </div>
        <div className="wifi-hero-actions">
          <Badge variant="success">
            <RadioTower aria-hidden="true" size={13} />
            Ping ready
          </Badge>
          <Badge variant="secondary">Admin password controls</Badge>
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
          <div className="wifi-toolbar pos-toolbar">
            <div className="wifi-search">
              <Search aria-hidden="true" className="crud-search-icon" size={17} />
              <Input
                placeholder="Search branch, contract, code, IP, sales path"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="wifi-filter-grid pos-filter-grid">
              <Select value={branch} onChange={(event) => setBranch(event.target.value)}>
                <option value="all">All branches</option>
                {posBranchOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">All statuses</option>
                {posStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select value={mallServerIp} onChange={(event) => setMallServerIp(event.target.value)}>
                <option value="all">All mall server IPs</option>
                {mallServerOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select value={missingData} onChange={(event) => setMissingData(event.target.value)}>
                <option value="all">All data states</option>
                <option value="ip">Missing IP details</option>
                <option value="salesPath">Missing sales path</option>
                <option value="credentials">Missing credentials</option>
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
              <Button disabled={!canCreate} type="button" onClick={() => setActiveModal('add')}>
                <Plus aria-hidden="true" size={16} />
                Add POS Hookup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="wifi-layout-grid">
        <Card className="wifi-table-card">
          <CardHeader>
            <div>
              <p className="section-kicker">POS Network Inventory</p>
              <CardTitle>POS Hookup Table</CardTitle>
            </div>
            <Badge variant="secondary">
              <Filter aria-hidden="true" size={13} />
              Duplicate and missing data checks
            </Badge>
          </CardHeader>
          <CardContent>
            <PosHookupTable
              canDelete={canDelete}
              canEdit={canEdit}
              canViewPasswords={canViewPasswords}
              data={filteredRows}
              onEdit={(record) => openModal('edit', record)}
              onSelect={setSelectedRecord}
              onTest={(record) => openModal('test', record)}
              onView={(record) => openModal('view', record)}
            />
          </CardContent>
        </Card>

        <aside className="wifi-details-panel">
          <div className="wifi-details-panel-inner">
            <div>
              <p className="section-kicker">Selected POS</p>
              <h3>{selectedRecord?.code ?? 'No POS selected'}</h3>
            </div>
            {selectedRecord ? (
              <>
                <div className="wifi-detail-status">
                  <Badge variant={selectedRecord.status === 'Active' ? 'success' : 'warning'}>
                    {selectedRecord.status}
                  </Badge>
                  <span>{selectedRecord.branch}</span>
                </div>
                <dl className="wifi-detail-list">
                  <div>
                    <dt>Contract #</dt>
                    <dd>{selectedRecord.contractNumber}</dd>
                  </div>
                  <div>
                    <dt>IP / Gateway</dt>
                    <dd>
                      {selectedRecord.ipAddress} / {selectedRecord.gateway}
                    </dd>
                  </div>
                  <div>
                    <dt>Mall Serve IP</dt>
                    <dd>{selectedRecord.mallServerIp}</dd>
                  </div>
                  <div>
                    <dt>Sales Path</dt>
                    <dd>{selectedRecord.salesPath || 'Missing'}</dd>
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
                  <Button type="button" onClick={() => openModal('test', selectedRecord)}>
                    <RadioTower aria-hidden="true" size={16} />
                    Test
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </aside>
      </div>

      <PosHookupFormModal
        mode="add"
        open={activeModal === 'add'}
        onOpenChange={(open) => setActiveModal(open ? 'add' : null)}
      />
      <PosHookupFormModal
        mode="edit"
        open={activeModal === 'edit'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'edit' : null)}
      />
      <ViewPosDetailsModal
        open={activeModal === 'view'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'view' : null)}
      />
      <PosImportExcelModal
        open={activeModal === 'import'}
        onOpenChange={(open) => setActiveModal(open ? 'import' : null)}
      />
      <PosConnectionTestModal
        open={activeModal === 'test'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'test' : null)}
      />
    </section>
  )
}

export { PosHookupPage }

