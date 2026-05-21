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
import type { IpAddressingRecord } from './ipAddressingData'
import { useConfiguredTableColumns } from '../dynamic-tables/useConfiguredTableColumns'

type IpAddressingTableProps = {
  data: IpAddressingRecord[]
  isLoading: boolean
  error?: string | null
  canEdit: boolean
  canDelete: boolean
  onDelete: (record: IpAddressingRecord) => void
  onEdit: (record: IpAddressingRecord) => void
  onTest: (record: IpAddressingRecord) => void
  onView: (record: IpAddressingRecord) => void
  onSelect: (record: IpAddressingRecord) => void
}

function IpAddressingTable({
  data,
  isLoading,
  error,
  canEdit,
  canDelete,
  onDelete,
  onEdit,
  onTest,
  onView,
  onSelect,
}: IpAddressingTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const legacyColumns = useMemo<ColumnDef<IpAddressingRecord>[]>(
    () => [
      sortableColumn('location', 'Location'),
      {
        accessorKey: 'deviceType',
        header: ({ column }) => <SortButton column={column} label="Device Type" />,
        cell: ({ row }) => <DeviceTypeBadge deviceType={row.original.deviceType} />,
      },
      sortableColumn('name', 'Name'),
      sortableColumn('department', 'Department'),
      sortableColumn('deviceName', 'Device Name'),
      {
        accessorKey: 'macAddress',
        header: ({ column }) => <SortButton column={column} label="MAC Address" />,
        cell: ({ row }) => (
          <CopyValue
            flagged={row.original.duplicateMac || row.original.missingFields?.includes('MAC Address')}
            label="Copy MAC address"
            value={row.original.macAddress}
          />
        ),
      },
      {
        accessorKey: 'ipAddress',
        header: ({ column }) => <SortButton column={column} label="IP Address" />,
        cell: ({ row }) => (
          <CopyValue
            flagged={row.original.duplicateIp}
            label="Copy IP address"
            value={row.original.ipAddress}
          />
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
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open row actions"
                  className="row-action-trigger h-8 w-8"
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <MoreHorizontal aria-hidden="true" className="h-4 w-4" size={18} />
                  <span className="sr-only">Open row actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="row-action-menu z-50 w-44">
                <DropdownMenuItem onClick={() => onView(row.original)}>
                  <Eye aria-hidden="true" size={16} />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem disabled={!canEdit} onClick={() => onEdit(row.original)}>
                  <Pencil aria-hidden="true" size={16} />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  disabled={!canDelete}
                  onClick={() => onDelete(row.original)}
                >
                  <Trash2 aria-hidden="true" size={16} />
                  Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onTest(row.original)}>
                  <RadioTower aria-hidden="true" size={16} />
                  Test Connection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [canDelete, canEdit, onDelete, onEdit, onTest, onView],
  )
  const actionColumn = legacyColumns.find((column) => column.id === 'actions')
  const { columns, columnTools } = useConfiguredTableColumns({
    module: 'ip-addresses',
    dataColumns: legacyColumns.filter((column) => column.id !== 'actions'),
    actionColumn,
    onValuesSaved: (record, values) => {
      record.customFields = values
    },
  })
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    initialState: { pagination: { pageSize: 6 } },
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
          <span>filtered IP records</span>
        </div>
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
        {columnTools}
      </div>

      <div className="wifi-table-shell ip-table-shell">
        <Table className="wifi-data-table ip-addressing-table">
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
                <TableLoadingState message="Loading IP address records..." />
              </TableStateRow>
            ) : error ? (
              <TableStateRow colSpan={columns.length}>
                <TableErrorState message={error} />
              </TableStateRow>
            ) : visibleRows.length === 0 ? (
              <TableStateRow colSpan={columns.length}>
                <TableEmptyState title="No IP address records found." />
              </TableStateRow>
            ) : visibleRows.map((row) => (
              <TableRow
                className={
                  row.original.status === 'Conflict' ||
                  row.original.duplicateIp ||
                  row.original.duplicateMac ||
                  row.original.missingFields?.length
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
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)} -
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
  key: keyof IpAddressingRecord,
  label: string,
): ColumnDef<IpAddressingRecord> {
  return {
    accessorKey: key,
    header: ({ column }) => <SortButton column={column} label={label} />,
    cell: ({ getValue }) => <span>{String(getValue() ?? '')}</span>,
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

function StatusBadge({ status }: { status: IpAddressingRecord['status'] }) {
  const variant =
    status === 'Active' || status === 'Available'
      ? 'success'
      : status === 'Offline' || status === 'Conflict'
        ? 'destructive'
        : 'warning'

  return <Badge variant={variant}>{status}</Badge>
}

function DeviceTypeBadge({ deviceType }: { deviceType: IpAddressingRecord['deviceType'] }) {
  const label = deviceType === 'mobile' ? 'Mobile' : 'Desktop'

  return (
    <Badge
      className={`device-type-badge device-type-badge-${deviceType}`}
      variant="secondary"
    >
      {label}
    </Badge>
  )
}

export { IpAddressingTable }

