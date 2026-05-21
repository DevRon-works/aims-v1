import {
  Download,
  FileSpreadsheet,
  Filter,
  KeyRound,
  MonitorCog,
  Plus,
  RadioTower,
  Search,
  ShieldCheck,
  Store,
  UsersRound,
} from '../lib/icons'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { useAuth } from '../contexts/AuthContext.jsx'
import {
  RemoteConnectionTestModal,
  RemoteDesktopFormModal,
  RemoteImportExcelModal,
  ViewRemoteDetailsModal,
} from '../features/remote-desktop/RemoteDesktopModals'
import { RemoteDesktopTable } from '../features/remote-desktop/RemoteDesktopTable'
import {
  remoteDepartments,
  fetchRemoteDesktopRows,
  remoteLocations,
  type RemoteDesktopRecord,
} from '../features/remote-desktop/remoteDesktopData'
import { remoteStatusOptions } from '../features/remote-desktop/remoteDesktopSchema'

const summaryCards = [
  ['Total Remote Devices', 'total', MonitorCog],
  ['Avada Devices', 'avada', UsersRound],
  ['Boutique Devices', 'boutique', Store],
  ['Active Connections', 'active', RadioTower],
  ['Missing Passwords', 'missingPasswords', KeyRound],
  ['Recently Updated', 'recent', ShieldCheck],
] as const

function RemoteDesktopPage() {
  const { can, user } = useAuth() as {
    can: (resource: string, action: string) => boolean
    user: { role?: string } | null
  }
  const [activeSection, setActiveSection] = useState<'Avada' | 'Boutique'>('Avada')
  const [search, setSearch] = useState('')
  const [sectionFilter, setSectionFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toolFilter, setToolFilter] = useState('all')
  const [remoteRows, setRemoteRows] = useState<RemoteDesktopRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<RemoteDesktopRecord | null>(null)
  const [activeModal, setActiveModal] = useState<
    'add' | 'edit' | 'view' | 'import' | 'test' | null
  >(null)
  const canCreate = can('remote', 'create')
  const canEdit = can('remote', 'edit')
  const canDelete = can('remote', 'delete')
  const isSuperAdmin = user?.role === 'Super Admin'
  const canViewPasswords = ['Admin', 'Super Admin'].includes(user?.role ?? '')

  useEffect(() => {
    fetchRemoteDesktopRows()
      .then((rows) => {
        setRemoteRows(rows)
        setSelectedRecord(rows[0] ?? null)
      })
      .catch(() => {
        setRemoteRows([])
        setSelectedRecord(null)
      })
  }, [])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return remoteRows.filter((row) => {
      const effectiveLocation = row.type === 'Avada' ? row.location : row.branch
      const matchesTab = row.type === activeSection
      const matchesSearch =
        query.length === 0 ||
        Object.values(row).some((value) => String(value).toLowerCase().includes(query))
      const matchesSection = sectionFilter === 'all' || row.type === sectionFilter
      const matchesLocation = locationFilter === 'all' || effectiveLocation === locationFilter
      const matchesDepartment = departmentFilter === 'all' || row.department === departmentFilter
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter
      const matchesTool =
        toolFilter === 'all' ||
        (toolFilter === 'anydesk' && Boolean(row.anydeskId)) ||
        (toolFilter === 'teamviewer' && Boolean(row.teamViewer)) ||
        (toolFilter === 'missing' && row.missingCredentials)

      return (
        matchesTab &&
        matchesSearch &&
        matchesSection &&
        matchesLocation &&
        matchesDepartment &&
        matchesStatus &&
        matchesTool
      )
    })
  }, [
    activeSection,
    departmentFilter,
    locationFilter,
    search,
    sectionFilter,
    statusFilter,
    toolFilter,
    remoteRows,
  ])

  const summary = useMemo(() => {
    const avada = remoteRows.filter((row) => row.type === 'Avada').length
    const boutique = remoteRows.filter((row) => row.type === 'Boutique').length
    const active = remoteRows.filter((row) => row.status === 'Active').length
    const missingPasswords = remoteRows.filter((row) => !row.password).length
    const recent = remoteRows.filter((row) => row.lastUpdated.includes('Today')).length

    return {
      total: remoteRows.length,
      avada,
      boutique,
      active,
      missingPasswords,
      recent,
    }
  }, [remoteRows])

  function openModal(type: 'edit' | 'view' | 'test', record: RemoteDesktopRecord) {
    setSelectedRecord(record)
    setActiveModal(type)
  }

  return (
    <section className="wifi-page remote-page">
      <div className="wifi-page-hero">
        <div>
          <p className="section-kicker">Network Management / Remote Desktop</p>
          <h2>Remote Desktop</h2>
          <p>
            Manage all remote desktop access records for Avada Head Office and
            Boutique branches, including PC details, IP addresses, AnyDesk
            credentials, TeamViewer access, and POS terminal usage.
          </p>
        </div>
        <div className="wifi-hero-actions">
          <Badge variant="success">
            <MonitorCog aria-hidden="true" size={13} />
            Support ready
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

      <div className="remote-tabs" role="tablist" aria-label="Remote desktop sections">
        {(['Avada', 'Boutique'] as const).map((section) => (
          <button
            aria-selected={activeSection === section}
            className={activeSection === section ? 'remote-tab remote-tab-active' : 'remote-tab'}
            key={section}
            role="tab"
            type="button"
            onClick={() => setActiveSection(section)}
          >
            {section === 'Avada' ? 'Remote Desktop Avada' : 'Remote Desktop Boutique'}
          </button>
        ))}
      </div>

      <Card className="wifi-toolbar-card">
        <CardContent>
          <div className="wifi-toolbar remote-toolbar">
            <div className="wifi-search">
              <Search aria-hidden="true" className="crud-search-icon" size={17} />
              <Input
                placeholder="Search device, IP, AnyDesk, TeamViewer, branch"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="wifi-filter-grid remote-filter-grid">
              <Select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)}>
                <option value="all">All sections</option>
                <option value="Avada">Avada</option>
                <option value="Boutique">Boutique</option>
              </Select>
              <Select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
                <option value="all">All locations</option>
                {remoteLocations.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
                <option value="all">All departments</option>
                {remoteDepartments.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                {remoteStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select value={toolFilter} onChange={(event) => setToolFilter(event.target.value)}>
                <option value="all">All tools</option>
                <option value="anydesk">AnyDesk</option>
                <option value="teamviewer">TeamViewer</option>
                <option value="missing">Missing credentials</option>
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
                Add Remote Desktop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="wifi-layout-grid">
        <Card className="wifi-table-card">
          <CardHeader>
            <div>
              <p className="section-kicker">Remote Support Inventory</p>
              <CardTitle>
                {activeSection === 'Avada'
                  ? 'Remote Desktop Avada'
                  : 'Remote Desktop Boutique'}
              </CardTitle>
            </div>
            <Badge variant="secondary">
              <Filter aria-hidden="true" size={13} />
              Duplicate and credential checks
            </Badge>
          </CardHeader>
          <CardContent>
            <RemoteDesktopTable
              canDelete={canDelete}
              canEdit={canEdit}
              canViewPasswords={canViewPasswords}
              data={filteredRows}
              section={activeSection}
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
              <p className="section-kicker">Selected Remote</p>
              <h3>
                {selectedRecord
                  ? selectedRecord.type === 'Avada'
                    ? selectedRecord.name
                    : selectedRecord.computerName
                  : 'No remote selected'}
              </h3>
            </div>
            {selectedRecord ? (
              <>
                <div className="wifi-detail-status">
                  <Badge variant={selectedRecord.status === 'Active' ? 'success' : 'warning'}>
                    {selectedRecord.status}
                  </Badge>
                  <span>{selectedRecord.type}</span>
                </div>
                <dl className="wifi-detail-list">
                  <div>
                    <dt>Location / Branch</dt>
                    <dd>
                      {selectedRecord.type === 'Avada'
                        ? selectedRecord.location
                        : selectedRecord.branch}
                    </dd>
                  </div>
                  <div>
                    <dt>IP / AnyDesk</dt>
                    <dd>
                      {selectedRecord.ipAddress || 'No IP'} / {selectedRecord.anydeskId}
                    </dd>
                  </div>
                  <div>
                    <dt>TeamViewer</dt>
                    <dd>{selectedRecord.teamViewer || 'Not set'}</dd>
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

      <RemoteDesktopFormModal
        mode="add"
        open={activeModal === 'add'}
        onOpenChange={(open) => setActiveModal(open ? 'add' : null)}
      />
      <RemoteDesktopFormModal
        mode="edit"
        open={activeModal === 'edit'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'edit' : null)}
      />
      <ViewRemoteDetailsModal
        open={activeModal === 'view'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'view' : null)}
      />
      <RemoteImportExcelModal
        open={activeModal === 'import'}
        onOpenChange={(open) => setActiveModal(open ? 'import' : null)}
      />
      <RemoteConnectionTestModal
        open={activeModal === 'test'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'test' : null)}
      />
    </section>
  )
}

export { RemoteDesktopPage }

