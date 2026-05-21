import {
  Download,
  FileSpreadsheet,
  Filter,
  Hash,
  PhoneOff,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from '../lib/icons'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { useAuth } from '../contexts/AuthContext.jsx'
import {
  SocialMediaFormModal,
  SocialMediaHistoryModal,
  SocialMediaImportExcelModal,
  ViewSocialMediaDetailsModal,
} from '../features/social-media/SocialMediaModals'
import { SocialMediaTable } from '../features/social-media/SocialMediaTable'
import {
  fetchSocialMediaRows,
  shopNameOptions,
  socialDepartments,
  socialPeople,
  type SocialMediaRecord,
} from '../features/social-media/socialMediaData'
import {
  socialMediaStatusOptions,
  socialMediaTypeOptions,
} from '../features/social-media/socialMediaSchema'

const summaryCards = [
  ['Total Social Media Accounts', 'total', Share2],
  ['Active Accounts', 'active', ShieldCheck],
  ['Shop Accounts', 'shops', ShoppingBag],
  ['Missing Phone Numbers', 'missingPhone', PhoneOff],
  ['Missing Seller IDs', 'missingSeller', Hash],
  ['Recently Updated', 'recent', UserRound],
] as const

function SocialMediaPage() {
  const { can, user } = useAuth() as {
    can: (resource: string, action: string) => boolean
    user: { role?: string } | null
  }
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [department, setDepartment] = useState('all')
  const [personUsed, setPersonUsed] = useState('all')
  const [shopName, setShopName] = useState('all')
  const [status, setStatus] = useState('all')
  const [missingData, setMissingData] = useState('all')
  const [socialRows, setSocialRows] = useState<SocialMediaRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<SocialMediaRecord | null>(null)
  const [activeModal, setActiveModal] = useState<
    'add' | 'edit' | 'view' | 'import' | 'history' | null
  >(null)
  const canCreate = can('social-media', 'create')
  const canEdit = can('social-media', 'edit')
  const canDelete = can('social-media', 'delete')
  const isSuperAdmin = user?.role === 'Super Admin'
  const canViewPasswords = ['Admin', 'Super Admin'].includes(user?.role ?? '')

  useEffect(() => {
    fetchSocialMediaRows()
      .then((rows) => {
        setSocialRows(rows)
        setSelectedRecord(rows[0] ?? null)
      })
      .catch(() => {
        setSocialRows([])
        setSelectedRecord(null)
      })
  }, [])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return socialRows.filter((row) => {
      const matchesSearch =
        query.length === 0 ||
        Object.values(row).some((value) => String(value).toLowerCase().includes(query))
      const matchesType = type === 'all' || row.type === type
      const matchesDepartment = department === 'all' || row.department === department
      const matchesPerson = personUsed === 'all' || row.personUsed === personUsed
      const matchesShop = shopName === 'all' || row.shopName === shopName
      const matchesStatus = status === 'all' || row.status === status
      const matchesMissing =
        missingData === 'all' ||
        (missingData === 'phone' && row.missingFields?.includes('Phone No.')) ||
        (missingData === 'seller' &&
          row.missingFields?.includes('Seller ID / Shop Code')) ||
        (missingData === 'duplicates' && (row.duplicateEmail || row.duplicateSellerId))

      return (
        matchesSearch &&
        matchesType &&
        matchesDepartment &&
        matchesPerson &&
        matchesShop &&
        matchesStatus &&
        matchesMissing
      )
    })
  }, [department, missingData, personUsed, search, shopName, socialRows, status, type])

  const summary = useMemo(() => {
    const active = socialRows.filter((row) => row.status === 'Active').length
    const shops = socialRows.filter((row) => Boolean(row.shopName)).length
    const missingPhone = socialRows.filter((row) =>
      row.missingFields?.includes('Phone No.'),
    ).length
    const missingSeller = socialRows.filter((row) =>
      row.missingFields?.includes('Seller ID / Shop Code'),
    ).length
    const recent = socialRows.filter((row) => row.lastUpdated.includes('Today')).length

    return {
      total: socialRows.length,
      active,
      shops,
      missingPhone,
      missingSeller,
      recent,
    }
  }, [socialRows])

  function openModal(type: 'edit' | 'view' | 'history', record: SocialMediaRecord) {
    setSelectedRecord(record)
    setActiveModal(type)
  }

  return (
    <section className="wifi-page social-page">
      <div className="wifi-page-hero">
        <div>
          <p className="section-kicker">Online Department / Social Media</p>
          <h2>Social Media</h2>
          <p>
            Manage all social media and online department accounts, including email,
            department, assigned person, shop name, seller ID/shop code, and phone number.
          </p>
        </div>
        <div className="wifi-hero-actions">
          <Badge variant="success">
            <Share2 aria-hidden="true" size={13} />
            Online account tracking
          </Badge>
          <Badge variant="secondary">Masked passwords</Badge>
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
          <div className="wifi-toolbar social-toolbar">
            <div className="wifi-search">
              <Search aria-hidden="true" className="crud-search-icon" size={17} />
              <Input
                placeholder="Search platform, email, shop, seller ID, phone"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="wifi-filter-grid social-filter-grid">
              <Select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="all">All types</option>
                {socialMediaTypeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
              <Select value={department} onChange={(event) => setDepartment(event.target.value)}>
                <option value="all">All departments</option>
                {socialDepartments.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
              <Select value={personUsed} onChange={(event) => setPersonUsed(event.target.value)}>
                <option value="all">All assigned users</option>
                {socialPeople.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
              <Select value={shopName} onChange={(event) => setShopName(event.target.value)}>
                <option value="all">All shops</option>
                {shopNameOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
              <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">All statuses</option>
                {socialMediaStatusOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
              <Select value={missingData} onChange={(event) => setMissingData(event.target.value)}>
                <option value="all">All data states</option>
                <option value="phone">Missing phone numbers</option>
                <option value="seller">Missing seller IDs</option>
                <option value="duplicates">Duplicate email/seller ID</option>
              </Select>
            </div>
            <div className="wifi-toolbar-actions">
              <Button disabled={!isSuperAdmin} type="button" variant="ghost" onClick={() => setActiveModal('import')}>
                <FileSpreadsheet aria-hidden="true" size={16} />
                Import Excel
              </Button>
              <Button disabled={!isSuperAdmin} type="button" variant="ghost">
                <Download aria-hidden="true" size={16} />
                Export
              </Button>
              <Button disabled={!canCreate} type="button" onClick={() => setActiveModal('add')}>
                <Plus aria-hidden="true" size={16} />
                Add Social Media Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="wifi-layout-grid">
        <Card className="wifi-table-card">
          <CardHeader>
            <div>
              <p className="section-kicker">Social Media Online Department</p>
              <CardTitle>Social Media Accounts Table</CardTitle>
            </div>
            <Badge variant="secondary">
              <Filter aria-hidden="true" size={13} />
              Missing and duplicate checks
            </Badge>
          </CardHeader>
          <CardContent>
            <SocialMediaTable
              canDelete={canDelete}
              canEdit={canEdit}
              canViewPasswords={canViewPasswords}
              data={filteredRows}
              onEdit={(record) => openModal('edit', record)}
              onHistory={(record) => openModal('history', record)}
              onSelect={setSelectedRecord}
              onView={(record) => openModal('view', record)}
            />
          </CardContent>
        </Card>

        <aside className="wifi-details-panel">
          <div className="wifi-details-panel-inner">
            <div>
              <p className="section-kicker">Selected Online Account</p>
              <h3>{selectedRecord?.shopName || selectedRecord?.email || 'No account selected'}</h3>
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
                    <dt>Email</dt>
                    <dd>{selectedRecord.email}</dd>
                  </div>
                  <div>
                    <dt>Department / Person</dt>
                    <dd>{selectedRecord.department} / {selectedRecord.personUsed || 'Unassigned'}</dd>
                  </div>
                  <div>
                    <dt>Seller / Phone</dt>
                    <dd>{selectedRecord.sellerIdShopCode || 'Missing'} / {selectedRecord.phoneNumber || 'Missing'}</dd>
                  </div>
                  <div>
                    <dt>Last Updated</dt>
                    <dd>{selectedRecord.lastUpdated} by {selectedRecord.updatedBy}</dd>
                  </div>
                </dl>
                <div className="wifi-detail-actions">
                  <Button type="button" variant="ghost" onClick={() => openModal('view', selectedRecord)}>View details</Button>
                  <Button type="button" onClick={() => openModal('history', selectedRecord)}>History</Button>
                </div>
              </>
            ) : null}
          </div>
        </aside>
      </div>

      <SocialMediaFormModal mode="add" open={activeModal === 'add'} onOpenChange={(open) => setActiveModal(open ? 'add' : null)} />
      <SocialMediaFormModal mode="edit" open={activeModal === 'edit'} record={selectedRecord} onOpenChange={(open) => setActiveModal(open ? 'edit' : null)} />
      <ViewSocialMediaDetailsModal open={activeModal === 'view'} record={selectedRecord} onOpenChange={(open) => setActiveModal(open ? 'view' : null)} />
      <SocialMediaImportExcelModal open={activeModal === 'import'} onOpenChange={(open) => setActiveModal(open ? 'import' : null)} />
      <SocialMediaHistoryModal open={activeModal === 'history'} record={selectedRecord} onOpenChange={(open) => setActiveModal(open ? 'history' : null)} />
    </section>
  )
}

export { SocialMediaPage }

