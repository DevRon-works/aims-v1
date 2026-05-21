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
  MoreHorizontal,
  Network,
  Pencil,
  RadioTower,
  Router,
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
import type { WifiDataRecord } from './wifiData'
import { useConfiguredTableColumns } from '../dynamic-tables/useConfiguredTableColumns'

type WifiDataTableProps = {
  data: WifiDataRecord[]
  isLoading?: boolean
  error?: string | null
  canEdit: boolean
  canDelete: boolean
  canViewPasswords: boolean
  onEdit: (record: WifiDataRecord) => void
  onTest: (record: WifiDataRecord) => void
  onView: (record: WifiDataRecord) => void
  onSelect: (record: WifiDataRecord) => void
}

function WifiDataTable({
  data,
  isLoading = false,
  error,
  canEdit,
  canDelete,
  canViewPasswords,
  onEdit,
  onTest,
  onView,
  onSelect,
}: WifiDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [passwordsVisible, setPasswordsVisible] = useState(false)
  const legacyColumns = useMemo<ColumnDef<WifiDataRecord>[]>(
    () => [
      sortableColumn('location', 'Location'),
      sortableColumn('areaFloor', 'Area / Floor'),
      {
        accessorKey: 'ispProvider',
        header: ({ column }) => <SortButton column={column} label="ISP Provider" />,
        cell: ({ row }) => <IspBadge provider={row.original.ispProvider} />,
      },
      {
        id: 'router',
        header: 'Router Brand / Model',
        accessorFn: (row) => `${row.routerBrand} ${row.routerModel}`,
        cell: ({ row }) => (
          <span className="wifi-router-cell">
            <Router aria-hidden="true" size={15} />
            {row.original.routerBrand} {row.original.routerModel}
          </span>
        ),
      },
      sortableColumn('portalUsername', 'Portal Username'),
      {
        accessorKey: 'portalPassword',
        header: 'Portal Password',
        cell: ({ row }) => (
          <SecretValue
            value={row.original.portalPassword}
            visible={canViewPasswords && passwordsVisible}
          />
        ),
      },
      {
        accessorKey: 'ssidName',
        header: ({ column }) => <SortButton column={column} label="SSID Name" />,
        cell: ({ row }) => (
          <CopyValue
            value={row.original.ssidName}
            flagged={row.original.duplicateSsid}
            label="Copy SSID"
          />
        ),
      },
      {
        accessorKey: 'wifiPassword',
        header: () => (
          <button
            className="wifi-password-toggle"
            type="button"
            onClick={() => setPasswordsVisible((current) => !current)}
          >
            WiFi Password
            {passwordsVisible ? (
              <EyeOff aria-hidden="true" size={14} />
            ) : (
              <Eye aria-hidden="true" size={14} />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <SecretValue
            copyable
            value={row.original.wifiPassword}
            visible={canViewPasswords && passwordsVisible}
          />
        ),
      },
      {
        accessorKey: 'wanIp',
        header: ({ column }) => <SortButton column={column} label="WAN IP" />,
        cell: ({ row }) => (
          <CopyValue
            value={row.original.wanIp}
            flagged={row.original.duplicateIp}
            label="Copy WAN IP"
          />
        ),
      },
      ipColumn('gatewayIp', 'Gateway IP'),
      ipColumn('lanIp', 'LAN IP'),
      ipColumn('deviceIp', 'Device IP'),
      sortableColumn('deviceType', 'Device Type'),
      sortableColumn('connectionType', 'Connection Type'),
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
                  Ping / Test
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.open(`http://${row.original.deviceIp}`, '_blank')}
                >
                  <Network aria-hidden="true" size={16} />
                  Open router IP
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onView(row.original)}>
                  <History aria-hidden="true" size={16} />
                  Logs / history
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
    ],
    [
      canDelete,
      canEdit,
      canViewPasswords,
      onEdit,
      onTest,
      onView,
      passwordsVisible,
    ],
  )
  const actionColumn = legacyColumns.find((column) => column.id === 'actions')
  const { columns, columnTools } = useConfiguredTableColumns({
    module: 'wifi-data',
    dataColumns: legacyColumns.filter((column) => column.id !== 'actions'),
    actionColumn,
    canViewPasswords,
  })
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
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
          <span>filtered networks</span>
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

      <div className="wifi-table-shell">
        <Table className="wifi-data-table">
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
                <TableLoadingState message="Loading WiFi records..." />
              </TableStateRow>
            ) : error ? (
              <TableStateRow colSpan={columns.length}>
                <TableErrorState message={error} />
              </TableStateRow>
            ) : visibleRows.length === 0 ? (
              <TableStateRow colSpan={columns.length}>
                <TableEmptyState title="No WiFi records found." />
              </TableStateRow>
            ) : visibleRows.map((row) => (
              <TableRow
                className={row.original.status !== 'Active' ? 'wifi-row-attention' : ''}
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

function sortableColumn(key: keyof WifiDataRecord, label: string): ColumnDef<WifiDataRecord> {
  return {
    accessorKey: key,
    header: ({ column }) => <SortButton column={column} label={label} />,
    cell: ({ getValue }) => <span>{String(getValue() ?? '')}</span>,
  }
}

function ipColumn(key: keyof WifiDataRecord, label: string): ColumnDef<WifiDataRecord> {
  return {
    accessorKey: key,
    header: ({ column }) => <SortButton column={column} label={label} />,
    cell: ({ getValue }) => <CopyValue value={String(getValue() ?? '')} label={`Copy ${label}`} />,
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

function SecretValue({
  value,
  visible,
  copyable = false,
}: {
  value: string
  visible: boolean
  copyable?: boolean
}) {
  return visible ? (
    <CopyValue value={value} label="Copy password" />
  ) : (
    <span className="secret-value">
      {copyable ? '••••••••••••' : 'Encrypted'}
      <EyeOff aria-hidden="true" size={13} />
    </span>
  )
}

function StatusBadge({ status }: { status: WifiDataRecord['status'] }) {
  const variant =
    status === 'Active'
      ? 'success'
      : status === 'Offline' || status === 'Disconnected'
        ? 'destructive'
        : 'warning'

  return <Badge variant={variant}>{status}</Badge>
}

function IspBadge({ provider }: { provider: string }) {
  return <span className={`isp-badge isp-badge-${provider.toLowerCase()}`}>{provider}</span>
}

export { WifiDataTable }

