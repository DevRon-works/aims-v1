import {
  Database,
  Download,
  FileSpreadsheet,
  Filter,
  MapPin,
  Plus,
  RadioTower,
  Router,
  Search,
  ShieldCheck,
  Signal,
  Wifi,
  WifiOff,
} from '../lib/icons'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { useAuth } from '../contexts/AuthContext.jsx'
import {
  ConnectionTestModal,
  ImportExcelModal,
  ViewNetworkDetailsModal,
  WifiDataFormModal,
} from '../features/wifi-data/WifiDataModals'
import { WifiDataTable } from '../features/wifi-data/WifiDataTable'
import {
  ispOptions,
  fetchWifiDataRows,
  locationOptions,
  type WifiDataRecord,
} from '../features/wifi-data/wifiData'
import { deviceTypeOptions, statusOptions } from '../features/wifi-data/wifiDataSchema'

const summaryConfig = [
  ['Total WiFi Networks', 'ssidName', Wifi],
  ['Total ISP Providers', 'ispProvider', Database],
  ['Active Routers', 'activeRouters', Router],
  ['Branch Locations', 'location', MapPin],
  ['Offline Connections', 'offline', WifiOff],
  ['Public IP Count', 'publicIpCount', ShieldCheck],
] as const

function WifiDataPage() {
  const { can, user } = useAuth() as {
    can: (resource: string, action: string) => boolean
    user: { role?: string } | null
  }
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('all')
  const [isp, setIsp] = useState('all')
  const [deviceType, setDeviceType] = useState('all')
  const [status, setStatus] = useState('all')
  const [wifiRows, setWifiRows] = useState<WifiDataRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<WifiDataRecord | null>(null)
  const [activeModal, setActiveModal] = useState<
    'add' | 'edit' | 'view' | 'test' | 'import' | null
  >(null)
  const canCreate = can('wifi-data', 'create')
  const canEdit = can('wifi-data', 'edit')
  const canDelete = can('wifi-data', 'delete')
  const canExport = can('wifi-data', 'export')
  const canViewPasswords = ['Admin', 'Super Admin'].includes(user?.role ?? '')

  useEffect(() => {
    fetchWifiDataRows()
      .then((rows) => {
        setWifiRows(rows)
        setSelectedRecord(rows[0] ?? null)
      })
      .catch(() => {
        setWifiRows([])
        setSelectedRecord(null)
      })
  }, [])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return wifiRows.filter((row) => {
      const matchesSearch =
        query.length === 0 ||
        Object.values(row).some((value) => String(value).toLowerCase().includes(query))
      const matchesLocation = location === 'all' || row.location === location
      const matchesIsp = isp === 'all' || row.ispProvider === isp
      const matchesDeviceType = deviceType === 'all' || row.deviceType === deviceType
      const matchesStatus = status === 'all' || row.status === status

      return matchesSearch && matchesLocation && matchesIsp && matchesDeviceType && matchesStatus
    })
  }, [deviceType, isp, location, search, status, wifiRows])

  const summary = useMemo(() => {
    const uniqueProviders = new Set(wifiRows.map((row) => row.ispProvider)).size
    const uniqueLocations = new Set(wifiRows.map((row) => row.location)).size
    const activeRouters = wifiRows.filter((row) => row.status === 'Active').length
    const offline = wifiRows.filter((row) =>
      ['Offline', 'Disconnected'].includes(row.status),
    ).length
    const publicIpCount = wifiRows.reduce((total, row) => total + row.publicIpCount, 0)

    return {
      ssidName: wifiRows.length,
      ispProvider: uniqueProviders,
      activeRouters,
      location: uniqueLocations,
      offline,
      publicIpCount,
    }
  }, [wifiRows])

  function openModal(type: 'edit' | 'view' | 'test', record: WifiDataRecord) {
    setSelectedRecord(record)
    setActiveModal(type)
  }

  return (
    <section className="wifi-page">
      <div className="wifi-page-hero">
        <div>
          <p className="section-kicker">Network Management / WiFi Data</p>
          <h2>WiFi Data</h2>
          <p>
            Manage all internet providers, routers, WiFi SSIDs, ISP accounts, and IP
            address information across Head Office and Store branches.
          </p>
        </div>
        <div className="wifi-hero-actions">
          <Badge variant="success">
            <Signal aria-hidden="true" size={13} />
            Monitoring ready
          </Badge>
          <Badge variant="secondary">Passwords encrypted</Badge>
        </div>
      </div>

      <div className="wifi-summary-grid">
        {summaryConfig.map(([label, key, Icon]) => (
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
          <div className="wifi-toolbar">
            <div className="wifi-search">
              <Search aria-hidden="true" className="crud-search-icon" size={17} />
              <Input
                placeholder="Search location, SSID, IP, ISP, router"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="wifi-filter-grid">
              <Select value={location} onChange={(event) => setLocation(event.target.value)}>
                <option value="all">All locations</option>
                {locationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select value={isp} onChange={(event) => setIsp(event.target.value)}>
                <option value="all">All ISPs</option>
                {ispOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select value={deviceType} onChange={(event) => setDeviceType(event.target.value)}>
                <option value="all">All devices</option>
                {deviceTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">All statuses</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <div className="wifi-toolbar-actions">
              <Button
                disabled={!canExport}
                type="button"
                variant="ghost"
                onClick={() => setActiveModal('import')}
              >
                <FileSpreadsheet aria-hidden="true" size={16} />
                Import Excel
              </Button>
              <Button disabled={!canExport} type="button" variant="ghost">
                <Download aria-hidden="true" size={16} />
                Export
              </Button>
              <Button disabled={!canCreate} type="button" onClick={() => setActiveModal('add')}>
                <Plus aria-hidden="true" size={16} />
                Add WiFi Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="wifi-layout-grid">
        <Card className="wifi-table-card">
          <CardHeader>
            <div>
              <p className="section-kicker">Inventory</p>
              <CardTitle>WiFi Data Table</CardTitle>
            </div>
            <Badge variant="secondary">
              <Filter aria-hidden="true" size={13} />
              Search and filters pinned above
            </Badge>
          </CardHeader>
          <CardContent>
            <WifiDataTable
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
              <p className="section-kicker">Selected Network</p>
              <h3>{selectedRecord?.ssidName ?? 'No network selected'}</h3>
            </div>
            {selectedRecord ? (
              <>
                <div className="wifi-detail-status">
                  <Badge variant={selectedRecord.status === 'Active' ? 'success' : 'warning'}>
                    {selectedRecord.status}
                  </Badge>
                  <span>{selectedRecord.connectionType}</span>
                </div>
                <dl className="wifi-detail-list">
                  <div>
                    <dt>Location</dt>
                    <dd>{selectedRecord.location}</dd>
                  </div>
                  <div>
                    <dt>Router</dt>
                    <dd>
                      {selectedRecord.routerBrand} {selectedRecord.routerModel}
                    </dd>
                  </div>
                  <div>
                    <dt>Device IP</dt>
                    <dd>{selectedRecord.deviceIp}</dd>
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

      <WifiDataFormModal
        mode="add"
        open={activeModal === 'add'}
        onOpenChange={(open) => setActiveModal(open ? 'add' : null)}
      />
      <WifiDataFormModal
        mode="edit"
        open={activeModal === 'edit'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'edit' : null)}
      />
      <ViewNetworkDetailsModal
        open={activeModal === 'view'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'view' : null)}
      />
      <ConnectionTestModal
        open={activeModal === 'test'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'test' : null)}
      />
      <ImportExcelModal
        open={activeModal === 'import'}
        onOpenChange={(open) => setActiveModal(open ? 'import' : null)}
      />
    </section>
  )
}

export { WifiDataPage }
