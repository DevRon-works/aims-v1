import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from '../../lib/icons'
import { AddRecordModal } from '../modals/AddRecordModal.jsx'
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal.jsx'
import { EditRecordModal } from '../modals/EditRecordModal.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { TableEmptyState, TableErrorState, TableLoadingState } from '../ui/table-states'
import { TableColumnEditorButton } from '../../features/dynamic-tables/useConfiguredTableColumns'

function getStatusVariant(status) {
  if (status === 'Active') {
    return 'success'
  }

  if (status === 'Review') {
    return 'warning'
  }

  if (status === 'Disabled') {
    return 'secondary'
  }

  return 'default'
}

function CrudPageTemplate({
  title,
  description,
  resource,
  columns = [],
  rows = [],
  isLoading = false,
  error = null,
}) {
  const { can } = useAuth()
  const permissionResource = resource ?? 'dashboard'
  const canCreate = can(permissionResource, 'create')
  const canEdit = can(permissionResource, 'edit')
  const canDelete = can(permissionResource, 'delete')
  const canExport = can(permissionResource, 'export')
  const hasRows = rows.length > 0
  const [activeRecord, setActiveRecord] = useState(null)
  const [modalType, setModalType] = useState(null)

  function openRecordModal(type, record) {
    setActiveRecord(record)
    setModalType(type)
  }

  function closeModal() {
    setModalType(null)
    setActiveRecord(null)
  }

  return (
    <section className="crud-page">
      <div className="crud-header">
        <div>
          <p className="section-kicker">Management</p>
          <h2>{title}</h2>
          <p className="crud-description">{description}</p>
        </div>
        <Button
          className="crud-add-button"
          type="button"
          disabled={!canCreate}
          onClick={() => openRecordModal('add', null)}
        >
          <Plus aria-hidden="true" size={17} />
          Add
        </Button>
      </div>

      <Card className="crud-card">
        <CardHeader>
          <div>
            <CardTitle>Records</CardTitle>
            <p className="crud-card-description">Search, filter, and manage records.</p>
          </div>
          <Button type="button" variant="ghost" disabled={!canExport}>
            <Download aria-hidden="true" size={16} />
            Export
          </Button>
          <TableColumnEditorButton module={permissionResource} />
        </CardHeader>
        <CardContent>
          <div className="crud-toolbar">
            <div className="crud-search">
              <Search aria-hidden="true" className="crud-search-icon" size={17} />
              <Input placeholder={`Search ${title.toLowerCase()}`} type="search" />
            </div>
            <div className="crud-filters">
              <Select defaultValue="all">
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="review">Review</option>
                <option value="disabled">Disabled</option>
              </Select>
              <Select defaultValue="30">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </Select>
              <Button type="button" variant="ghost" className="crud-filter-button">
                <SlidersHorizontal aria-hidden="true" size={16} />
                Filters
              </Button>
            </div>
          </div>

          <div className="crud-table-shell">
            {isLoading ? (
              <TableLoadingState />
            ) : error ? (
              <TableErrorState message={error} />
            ) : !hasRows ? (
              <TableEmptyState />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column.key}>{column.label}</TableHead>
                    ))}
                    <TableHead className="table-action-column">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {columns.map((column) => (
                        <TableCell key={column.key}>
                          {column.key === 'status' ? (
                            <Badge variant={getStatusVariant(row[column.key])}>
                              {row[column.key]}
                            </Badge>
                          ) : (
                            row[column.key]
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="table-action-column">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="row-action-trigger">
                            <MoreHorizontal aria-hidden="true" size={18} />
                            <span className="sr-only">Open row actions</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="row-action-menu">
                            <DropdownMenuItem>
                              <Eye aria-hidden="true" size={16} />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={!canEdit}
                              onClick={() => openRecordModal('edit', row)}
                            >
                              <Pencil aria-hidden="true" size={16} />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={!canDelete}
                              onClick={() => openRecordModal('delete', row)}
                            >
                              <Trash2 aria-hidden="true" size={16} />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="crud-pagination">
            <p>Showing {rows.length} records</p>
            <div className="pagination-actions">
              <Button type="button" variant="ghost" size="icon" aria-label="Previous page">
                <ChevronLeft aria-hidden="true" size={17} />
              </Button>
              <Badge variant="secondary">Page 1</Badge>
              <Button type="button" variant="ghost" size="icon" aria-label="Next page">
                <ChevronRight aria-hidden="true" size={17} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddRecordModal
        open={modalType === 'add'}
        title={title}
        onOpenChange={(open) => {
          if (!open) {
            closeModal()
          }
        }}
      />
      <EditRecordModal
        open={modalType === 'edit'}
        record={activeRecord}
        onOpenChange={(open) => {
          if (!open) {
            closeModal()
          }
        }}
      />
      <DeleteConfirmationModal
        open={modalType === 'delete'}
        record={activeRecord}
        onOpenChange={(open) => {
          if (!open) {
            closeModal()
          }
        }}
      />
    </section>
  )
}

export { CrudPageTemplate }
