import {
  AlertTriangle,
  Database,
  Download,
  FileSpreadsheet,
  Filter,
  HardDrive,
  MapPin,
  Monitor,
  Network,
  Phone,
  Plus,
  RadioTower,
  Search,
  ShieldCheck,
} from '../lib/icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { useAuth } from '../contexts/AuthContext.jsx'
import {
  IpAddressingFormModal,
  IpConnectionTestModal,
  IpImportExcelModal,
  ViewIpDetailsModal,
} from '../features/ip-addressing/IpAddressingModals'
import { IpAddressingTable } from '../features/ip-addressing/IpAddressingTable'
import {
  deleteIpAddressingRecord,
  fetchIpAddressingRows,
  ipDepartmentOptions,
  ipLocationOptions,
  testIpAddressConnection,
  type IpConnectionTestResult,
  type IpAddressingRecord,
} from '../features/ip-addressing/ipAddressingData'
import { ipStatusOptions } from '../features/ip-addressing/ipAddressingSchema'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog'

const summaryCards = [
  ['Total IP Records', 'total', Database],
  ['Total Desktop IPs', 'desktop', Monitor],
  ['Total Mobile IPs', 'mobile', Phone],
  ['Active Devices', 'active', HardDrive],
  ['Duplicate IP Detected', 'duplicateIp', AlertTriangle],
  ['Missing MAC Address', 'missingMac', Network],
  ['Available IP Range', 'available', MapPin],
  ['Recently Updated', 'recent', ShieldCheck],
] as const

function IpAddressingPage() {
  const { can, user } = useAuth() as {
    can: (resource: string, action: string) => boolean
    user: { role?: string } | null
  }
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('all')
  const [department, setDepartment] = useState('all')
  const [deviceType, setDeviceType] = useState('all')
  const [status, setStatus] = useState('all')
  const [missingData, setMissingData] = useState('all')
  const [ipAddressingRows, setIpAddressingRows] = useState<IpAddressingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<IpAddressingRecord | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<IpAddressingRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionTestResult, setConnectionTestResult] =
    useState<IpConnectionTestResult | null>(null)
  const [activeModal, setActiveModal] = useState<
    'add' | 'edit' | 'view' | 'import' | 'test' | null
  >(null)
  const canCreate = can('ip-addressing', 'create')
  const canEdit = can('ip-addressing', 'edit')
  const canDelete = can('ip-addressing', 'delete')
  const isSuperAdmin = user?.role === 'Super Admin'

  const loadIpAddresses = useCallback(async (options?: { preserveSelection?: boolean }) => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const rows = await fetchIpAddressingRows()

        setIpAddressingRows(rows)
        setSelectedRecord((current) =>
          options?.preserveSelection &&
          current &&
          rows.some((row) => row.id === current.id)
            ? current
            : null,
        )
      } catch {
        setIpAddressingRows([])
        setSelectedRecord(null)
        setLoadError('IP address records could not be loaded.')
      } finally {
        setIsLoading(false)
      }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadInitialIpAddresses() {
      if (isMounted) {
        await loadIpAddresses({ preserveSelection: true })
      }
    }

    loadInitialIpAddresses()

    return () => {
      isMounted = false
    }
  }, [loadIpAddresses])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return ipAddressingRows.filter((row) => {
      const matchesSearch =
        query.length === 0 ||
        Object.values(row).some((value) => String(value).toLowerCase().includes(query))
      const matchesLocation = location === 'all' || row.location === location
      const matchesDepartment = department === 'all' || row.department === department
      const matchesDeviceType = deviceType === 'all' || row.deviceType === deviceType
      const matchesStatus = status === 'all' || row.status === status
      const matchesMissing =
        missingData === 'all' ||
        (missingData === 'mac' && row.missingFields?.includes('MAC Address')) ||
        (missingData === 'duplicates' && (row.duplicateIp || row.duplicateMac))

      return (
        matchesSearch &&
        matchesLocation &&
        matchesDepartment &&
        matchesDeviceType &&
        matchesStatus &&
        matchesMissing
      )
    })
  }, [department, deviceType, ipAddressingRows, location, missingData, search, status])

  const summary = useMemo(() => {
    const desktop = ipAddressingRows.filter((row) => row.deviceType === 'desktop').length
    const mobile = ipAddressingRows.filter((row) => row.deviceType === 'mobile').length
    const active = ipAddressingRows.filter((row) => row.status === 'Active').length
    const duplicateIp = ipAddressingRows.filter((row) => row.duplicateIp).length
    const missingMac = ipAddressingRows.filter((row) =>
      row.missingFields?.includes('MAC Address'),
    ).length
    const available = ipAddressingRows.filter((row) => row.status === 'Available').length
    const recent = ipAddressingRows.filter((row) => row.lastUpdated.includes('Today')).length

    return {
      total: ipAddressingRows.length,
      desktop,
      mobile,
      active,
      duplicateIp,
      missingMac,
      available,
      recent,
    }
  }, [ipAddressingRows])

  function openModal(type: 'edit' | 'view' | 'test', record: IpAddressingRecord) {
    setSelectedRecord(record)
    setActiveModal(type)
  }

  async function handleDelete(record: IpAddressingRecord) {
    try {
      await deleteIpAddressingRecord(record.id)
      toast.success('IP address record deleted.')
      await loadIpAddresses()
    } catch {
      // The shared API interceptor displays the failure toast.
    }
  }

  async function confirmDelete() {
    if (!deleteCandidate) {
      return
    }

    setIsDeleting(true)
    try {
      await handleDelete(deleteCandidate)
      setDeleteCandidate(null)
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleTestConnection(record: IpAddressingRecord) {
    setSelectedRecord(record)
    setConnectionTestResult(null)
    setActiveModal('test')
    setIsTestingConnection(true)

    try {
      const result = await testIpAddressConnection(record.id)
      setConnectionTestResult(result)

      if (result.online) {
        toast.success('Device is reachable')
      } else {
        toast.error('Device is not reachable')
      }
    } catch {
      toast.error('Device is not reachable')
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <section className="wifi-page ip-page">
      <div className="wifi-page-hero">
        <div>
          <p className="section-kicker">Network Management / IP Addressing</p>
          <h2>IP Addressing</h2>
          <p>
            Manage and monitor all assigned IP addresses for devices across locations,
            departments, users, and device identifiers.
          </p>
        </div>
        <div className="wifi-hero-actions">
          <Badge variant="success">
            <RadioTower aria-hidden="true" size={13} />
            Ping ready
          </Badge>
          <Badge variant="secondary">Duplicate detection</Badge>
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
          <div className="wifi-toolbar ip-toolbar">
            <div className="wifi-search">
              <Search aria-hidden="true" className="crud-search-icon" size={17} />
              <Input
                placeholder="Search location, user, device, MAC, IP"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="wifi-filter-grid ip-filter-grid">
              <Select value={location} onChange={(event) => setLocation(event.target.value)}>
                <option value="all">All locations</option>
                {ipLocationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select value={department} onChange={(event) => setDepartment(event.target.value)}>
                <option value="all">All departments</option>
                {ipDepartmentOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select value={deviceType} onChange={(event) => setDeviceType(event.target.value)}>
                <option value="all">All device types</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </Select>
              <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">All statuses</option>
                {ipStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select value={missingData} onChange={(event) => setMissingData(event.target.value)}>
                <option value="all">All data states</option>
                <option value="mac">Missing MAC address</option>
                <option value="duplicates">Duplicate IP or MAC</option>
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
                Add IP Address
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="wifi-layout-grid">
        <Card className="wifi-table-card">
          <CardHeader>
            <div>
              <p className="section-kicker">Address Inventory</p>
              <CardTitle>IP Addressing Table</CardTitle>
            </div>
            <Badge variant="secondary">
              <Filter aria-hidden="true" size={13} />
              IP and MAC validation
            </Badge>
          </CardHeader>
          <CardContent>
            <IpAddressingTable
              canDelete={canDelete}
              canEdit={canEdit}
              data={filteredRows}
              error={loadError}
              isLoading={isLoading}
              onDelete={setDeleteCandidate}
              onEdit={(record) => openModal('edit', record)}
              onSelect={setSelectedRecord}
              onTest={handleTestConnection}
              onView={(record) => openModal('view', record)}
            />
          </CardContent>
        </Card>

        <aside className="wifi-details-panel">
          <div className="wifi-details-panel-inner">
            <div>
              <p className="section-kicker">Selected Address</p>
              <h3>{selectedRecord?.deviceName ?? 'No IP selected'}</h3>
            </div>
            {selectedRecord ? (
              <>
                <div className="wifi-detail-status">
                  <Badge variant={selectedRecord.status === 'Active' ? 'success' : 'warning'}>
                    {selectedRecord.status}
                  </Badge>
                  <Badge
                    className={`device-type-badge device-type-badge-${selectedRecord.deviceType}`}
                    variant="secondary"
                  >
                    {selectedRecord.deviceType === 'mobile' ? 'Mobile' : 'Desktop'}
                  </Badge>
                  <span>{selectedRecord.department}</span>
                </div>
                <dl className="wifi-detail-list">
                  <div>
                    <dt>Location</dt>
                    <dd>{selectedRecord.location}</dd>
                  </div>
                  <div>
                    <dt>Name</dt>
                    <dd>{selectedRecord.name}</dd>
                  </div>
                  <div>
                    <dt>IP / MAC</dt>
                    <dd>
                      {selectedRecord.ipAddress} / {selectedRecord.macAddress}
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
                    View Details
                  </Button>
                  <Button
                    disabled={isTestingConnection}
                    type="button"
                    onClick={() => handleTestConnection(selectedRecord)}
                  >
                    <RadioTower aria-hidden="true" size={16} />
                    Test Connection
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </aside>
      </div>

      <IpAddressingFormModal
        mode="add"
        open={activeModal === 'add'}
        onOpenChange={(open) => setActiveModal(open ? 'add' : null)}
        onSaved={() => loadIpAddresses()}
      />
      <IpAddressingFormModal
        mode="edit"
        open={activeModal === 'edit'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'edit' : null)}
        onSaved={() => loadIpAddresses({ preserveSelection: true })}
      />
      <ViewIpDetailsModal
        open={activeModal === 'view'}
        record={selectedRecord}
        onOpenChange={(open) => setActiveModal(open ? 'view' : null)}
      />
      <IpImportExcelModal
        open={activeModal === 'import'}
        onOpenChange={(open) => setActiveModal(open ? 'import' : null)}
      />
      <IpConnectionTestModal
        open={activeModal === 'test'}
        record={selectedRecord}
        result={connectionTestResult}
        isTesting={isTestingConnection}
        onOpenChange={(open) => setActiveModal(open ? 'test' : null)}
      />
      <Dialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="wifi-test-dialog">
          <DialogHeader>
            <DialogTitle>Delete IP Address</DialogTitle>
            <DialogDescription>
              This will permanently delete the selected IP address record.
            </DialogDescription>
          </DialogHeader>
          {deleteCandidate ? (
            <div className="delete-confirmation-panel">
              <p>
                Delete <strong>{deleteCandidate.deviceName}</strong> assigned to{' '}
                <strong>{deleteCandidate.ipAddress}</strong>?
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

export { IpAddressingPage }

