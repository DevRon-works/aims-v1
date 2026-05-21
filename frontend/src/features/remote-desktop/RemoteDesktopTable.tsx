import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  Eye,
  EyeOff,
  History,
  MonitorCog,
  MoreHorizontal,
  Pencil,
  RadioTower,
  Trash2,
} from '../../lib/icons'
import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { TableEmptyState, TableErrorState, TableLoadingState, TableStateRow } from '../../components/ui/table-states'
import type { RemoteDesktopRecord } from './remoteDesktopData'
import { useConfiguredTableColumns } from '../dynamic-tables/useConfiguredTableColumns'

type RemoteDesktopTableProps = {
  data: RemoteDesktopRecord[]
  isLoading?: boolean
  error?: string | null
  section: 'Avada' | 'Boutique'
  canEdit: boolean
  canDelete: boolean
  canViewPasswords: boolean
  onEdit: (record: RemoteDesktopRecord) => void
  onTest: (record: RemoteDesktopRecord) => void
  onView: (record: RemoteDesktopRecord) => void
  onSelect: (record: RemoteDesktopRecord) => void
}

function RemoteDesktopTable({
  data,
  isLoading = false,
  error,
  section,
  canEdit,
  canDelete,
  canViewPasswords,
  onEdit,
  onTest,
  onView,
  onSelect,
}: RemoteDesktopTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [passwordsVisible, setPasswordsVisible] = useState(false)
  const legacyColumns = useMemo<ColumnDef<RemoteDesktopRecord>[]>(
    () => {
      const sharedTail: ColumnDef<RemoteDesktopRecord>[] = [
        {
          accessorKey: 'anydeskId',
          header: ({ column }) => <SortButton column={column} label="AnyDesk ID" />,
          cell: ({ row }) => (
            <CopyValue
              flagged={row.original.duplicateAnydesk}
              label="Copy AnyDesk ID"
              value={row.original.anydeskId}
            />
          ),
        },
        {
          accessorKey: 'password',
          header: () => (
            <button
              className="wifi-password-toggle"
              type="button"
              onClick={() => setPasswordsVisible((current) => !current)}
            >
              Password
              {passwordsVisible ? (
                <EyeOff aria-hidden="true" size={14} />
              ) : (
                <Eye aria-hidden="true" size={14} />
              )}
            </button>
          ),
          cell: ({ row }) =>
            row.original.password ? (
              <SecretValue
                value={row.original.password}
                visible={canViewPasswords && passwordsVisible}
              />
            ) : (
              <span className="copy-value copy-value-flagged">Missing</span>
            ),
        },
        {
          accessorKey: 'teamViewer',
          id: 'teamViewer',
          header: 'TeamViewer',
          cell: ({ row }) =>
            row.original.teamViewer ? (
              <CopyValue label="Copy TeamViewer ID" value={row.original.teamViewer} />
            ) : (
              <span className="secret-value">Not set</span>
            ),
        },
        {
          accessorKey: 'status',
          header: ({ column }) => <SortButton column={column} label="Status" />,
          cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        sortableColumn('notes', 'Notes'),
        sortableColumn('lastUpdated', 'Last Updated'),
        sortableColumn('updatedBy', 'Updated By'),
        {
          id: 'actions',
          header: 'Actions',
          enableHiding: false,
          cell: ({ row }) => (
            <div className="wifi-actions-cell" onClick={(event) => event.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger className="row-action-trigger">
                  <MoreHorizontal aria-hidden="true" size={18} />
                  <span className="sr-only">Open row actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="row-action-menu">
                  <DropdownMenuItem onClick={() => onView(row.original)}>
                    <Eye aria-hidden="true" size={16} />
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTest(row.original)}>
                    <RadioTower aria-hidden="true" size={16} />
                    Ping / Test IP
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => window.open(`anydesk:${row.original.anydeskId}`, '_blank')}
                  >
                    <MonitorCog aria-hidden="true" size={16} />
                    Open AnyDesk
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={!row.original.teamViewer}
                    onClick={() => window.open(`teamviewer10://control?device=${row.original.teamViewer}`, '_blank')}
                  >
                    <MonitorCog aria-hidden="true" size={16} />
                    Open TeamViewer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onView(row.original)}>
                    <History aria-hidden="true" size={16} />
                    Audit logs
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled={!canEdit} onClick={() => onEdit(row.original)}>
                    <Pencil aria-hidden="true" size={16} />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={!canDelete}>
                    <Trash2 aria-hidden="true" size={16} />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
        },
      ]

      if (section === 'Avada') {
        return [
          sortableColumn('location', 'Location'),
          sortableColumn('name', 'Name'),
          sortableColumn('department', 'Department'),
          ipColumn('ipAddress', 'IP Address'),
          ...sharedTail.filter((column) => column.id !== 'teamViewer'),
        ]
      }

      return [
        sortableColumn('terminalNumber', 'Terminal #'),
        sortableColumn('computerName', 'Computer Name'),
        sortableColumn('branch', 'Branch'),
        sortableColumn('posDateUsed', 'POS Date Used'),
        ...sharedTail,
      ]
    },
    [
      canDelete,
      canEdit,
      canViewPasswords,
      onEdit,
      onTest,
      onView,
      passwordsVisible,
      section,
    ],
  )
  const actionColumn = legacyColumns.find((column) => column.id === 'actions')
  const { columns, columnTools } = useConfiguredTableColumns({
    module: 'remote-desktops',
    dataColumns: legacyColumns.filter((column) => column.id !== 'actions'),
    actionColumn,
    canViewPasswords,
  })
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    initialState: { pagination: { pageSize: 5 } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
  const visibleRows = table.getRowModel().rows

  return (
    <>
      <div className="wifi-table-utilities">
        <div className="wifi-table-count">
          <strong>{table.getFilteredRowModel().rows.length}</strong>
          <span>filtered remote devices</span>
        </div>
        {columnTools}
        <DropdownMenu>
          <DropdownMenuTrigger className="button button-ghost wifi-column-trigger">
            Columns
            <ChevronDown aria-hidden="true" size={15} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="wifi-column-menu">
            {table
              .getAllLeafColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <label className="wifi-column-option" key={column.id}>
                  <Checkbox
                    checked={column.getIsVisible()}
                    onChange={(event) => column.toggleVisibility(event.target.checked)}
                  />
                  <span>{column.id}</span>
                </label>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="wifi-table-shell remote-table-shell">
        <Table className="wifi-data-table remote-desktop-table">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className={header.column.id === 'actions' ? 'table-action-column' : ''}
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableStateRow colSpan={columns.length}>
                <TableLoadingState message="Loading remote access records..." />
              </TableStateRow>
            ) : error ? (
              <TableStateRow colSpan={columns.length}>
                <TableErrorState message={error} />
              </TableStateRow>
            ) : visibleRows.length === 0 ? (
              <TableStateRow colSpan={columns.length}>
                <TableEmptyState title="No remote access records found." />
              </TableStateRow>
            ) : visibleRows.map((row) => (
              <TableRow
                className={
                  row.original.status !== 'Active' ||
                  row.original.missingCredentials ||
                  row.original.duplicateAnydesk ||
                  row.original.duplicateIp
                    ? 'wifi-row-attention'
                    : ''
                }
                key={row.id}
                onClick={() => onSelect(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    className={cell.column.id === 'actions' ? 'table-action-column' : ''}
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="crud-pagination">
        <p>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} -
          showing {table.getRowModel().rows.length} rows
        </p>
        <div className="pagination-actions">
          <Button
            aria-label="Previous page"
            disabled={!table.getCanPreviousPage()}
            size="icon"
            type="button"
            variant="ghost"
            onClick={() => table.previousPage()}
          >
            <ChevronLeft aria-hidden="true" size={17} />
          </Button>
          <Badge variant="secondary">Page {table.getState().pagination.pageIndex + 1}</Badge>
          <Button
            aria-label="Next page"
            disabled={!table.getCanNextPage()}
            size="icon"
            type="button"
            variant="ghost"
            onClick={() => table.nextPage()}
          >
            <ChevronRight aria-hidden="true" size={17} />
          </Button>
        </div>
      </div>
    </>
  )
}

function sortableColumn(
  key: keyof RemoteDesktopRecord,
  label: string,
): ColumnDef<RemoteDesktopRecord> {
  return {
    accessorKey: key,
    header: ({ column }) => <SortButton column={column} label={label} />,
    cell: ({ getValue }) => <span>{String(getValue() ?? '') || 'Not set'}</span>,
  }
}

function ipColumn(
  key: keyof RemoteDesktopRecord,
  label: string,
): ColumnDef<RemoteDesktopRecord> {
  return {
    accessorKey: key,
    header: ({ column }) => <SortButton column={column} label={label} />,
    cell: ({ row, getValue }) => (
      <CopyValue
        flagged={row.original.duplicateIp}
        label={`Copy ${label}`}
        value={String(getValue() ?? '') || 'Not set'}
      />
    ),
  }
}

function SortButton({
  column,
  label,
}: {
  column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | 'asc' | 'desc' }
  label: string
}) {
  return (
    <button
      className="wifi-sort-button"
      type="button"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ChevronsUpDown aria-hidden="true" size={14} />
    </button>
  )
}

function CopyValue({
  value,
  label,
  flagged = false,
}: {
  value: string
  label: string
  flagged?: boolean
}) {
  function copyValue(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    navigator.clipboard?.writeText(value)
  }

  return (
    <span className={flagged ? 'copy-value copy-value-flagged' : 'copy-value'}>
      <span>{value}</span>
      <button aria-label={label} type="button" onClick={copyValue}>
        <Copy aria-hidden="true" size={13} />
      </button>
    </span>
  )
}

function SecretValue({ value, visible }: { value: string; visible: boolean }) {
  return visible ? (
    <CopyValue value={value} label="Copy password" />
  ) : (
    <span className="secret-value">
      Encrypted
      <EyeOff aria-hidden="true" size={13} />
    </span>
  )
}

function StatusBadge({ status }: { status: RemoteDesktopRecord['status'] }) {
  const variant =
    status === 'Active'
      ? 'success'
      : status === 'Offline' || status === 'No Access'
        ? 'destructive'
        : 'warning'

  return <Badge variant={variant}>{status}</Badge>
}

export { RemoteDesktopTable }
