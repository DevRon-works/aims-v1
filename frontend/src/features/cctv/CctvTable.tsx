import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { MouseEvent } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  RadioTower,
  RotateCcw,
  Trash2,
} from '../../lib/icons'
import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
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
import {
  TableEmptyState,
  TableErrorState,
  TableStateRow,
} from '../../components/ui/table-states'
import type { CctvPaginationMeta, CctvRecord, CctvSection } from './cctvData'
import { useConfiguredTableColumns } from '../dynamic-tables/useConfiguredTableColumns'

type CctvTableProps = {
  data: CctvRecord[]
  isLoading?: boolean
  error?: string | null
  section: CctvSection
  canEdit?: boolean
  canViewPasswords?: boolean
  pagination: CctvPaginationMeta
  onDelete?: (record: CctvRecord) => void
  onEdit?: (record: CctvRecord) => void
  onPageChange: (page: number) => void
  onPing?: (record: CctvRecord) => void
  onRestart?: (record: CctvRecord) => void
  onView?: (record: CctvRecord) => void
}

function CctvTable({
  data,
  isLoading = false,
  error,
  section,
  canEdit = true,
  canViewPasswords = true,
  pagination,
  onDelete,
  onEdit,
  onPageChange,
  onPing,
  onRestart,
  onView,
}: CctvTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})

  const legacyColumns = useMemo<ColumnDef<CctvRecord>[]>(() => {
    const passwordColumn: ColumnDef<CctvRecord> = {
      accessorKey: 'password',
      header: 'Password',
      cell: ({ row }) => {
        const visible = Boolean(visiblePasswords[row.original.id]) && canViewPasswords

        return (
          <SecretValue
            value={row.original.password ?? ''}
            visible={visible}
            onToggle={() =>
              setVisiblePasswords((current) => ({
                ...current,
                [row.original.id]: !current[row.original.id],
              }))
            }
          />
        )
      },
    }

    const commonCredentialColumns: ColumnDef<CctvRecord>[] = [
      textColumn('username', 'Username'),
      passwordColumn,
    ]

    const actionColumn: ColumnDef<CctvRecord> = {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => {
        const targetIp =
          row.original.type === 'Avada Center'
            ? row.original.cameraIp || row.original.nvrIp
            : row.original.webIp

        return (
          <div className="wifi-actions-cell" onClick={(event) => event.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger className="row-action-trigger cctv-action-trigger">
                <MoreHorizontal aria-hidden="true" size={18} />
                <span className="sr-only">Open CCTV actions</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="row-action-menu">
                <DropdownMenuItem onClick={() => onView?.(row.original)}>
                  <Eye aria-hidden="true" size={16} />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem disabled={!canEdit} onClick={() => onEdit?.(row.original)}>
                  <Pencil aria-hidden="true" size={16} />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPing?.(row.original)}>
                  <RadioTower aria-hidden="true" size={16} />
                  Ping Camera
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!targetIp}
                  onClick={() => window.open(`http://${targetIp}`, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink aria-hidden="true" size={16} />
                  Open Web UI
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onRestart?.(row.original)}>
                  <RotateCcw aria-hidden="true" size={16} />
                  Restart
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(row.original)}>
                  <Trash2 aria-hidden="true" size={16} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    }

    if (section === 'Avada Center') {
      return [
        textColumn('floorName', 'Floor Name'),
        textColumn('cameraNumber', 'Camera #'),
        textColumn('cameraName', 'Camera Name'),
        ...commonCredentialColumns,
        copyColumn('nvrIp', 'NVR IP', 'Copy NVR IP'),
        copyColumn('cameraIp', 'Camera IP', 'Copy Camera IP'),
        actionColumn,
      ]
    }

    if (section === 'Boutique') {
      return [
        textColumn('branch', 'Branch'),
        textColumn('brand', 'Brand'),
        textColumn('workingCameras', 'Working Cameras'),
        textColumn('serial', 'Serial'),
        ...commonCredentialColumns,
        copyColumn('webIp', 'Web IP', 'Copy Web IP'),
        textColumn('storage', 'Storage'),
        statusColumn(),
        actionColumn,
      ]
    }

    return [
      textColumn('branch', 'Branch'),
      textColumn('brand', 'Brand'),
      textColumn('model', 'Model'),
      textColumn('serial', 'Serial'),
      ...commonCredentialColumns,
      copyColumn('webIp', 'Web IP', 'Copy Web IP'),
      textColumn('storage', 'Storage'),
      statusColumn(),
      actionColumn,
    ]
  }, [
    canEdit,
    canViewPasswords,
    onDelete,
    onEdit,
    onPing,
    onRestart,
    onView,
    section,
    visiblePasswords,
  ])

  const actionColumn = legacyColumns.find((column) => column.id === 'actions')
  const schemaModule =
    section === 'Avada Center'
      ? 'cctv-avada-center'
      : section === 'Boutique'
        ? 'cctv-boutique'
        : 'cctv-warehouse-online'
  const { columns, columnTools } = useConfiguredTableColumns({
    module: schemaModule,
    dataColumns: legacyColumns.filter((column) => column.id !== 'actions'),
    actionColumn,
    canViewPasswords,
    onValuesSaved: (record, values) => {
      record.customFields = values
    },
  })
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const visibleRows = table.getRowModel().rows
  const currentPage = pagination.currentPage || 1
  const pageCount = pagination.lastPage || 1

  return (
    <>
      <div className="cctv-table-meta">
        <div>
          <strong>{pagination.total}</strong>
          <span> records in {section}</span>
        </div>
        <Badge variant="secondary">{isLoading ? 'Refreshing...' : 'Sticky header and actions'}</Badge>
        {columnTools}
      </div>

      <div className="wifi-table-shell cctv-table-shell">
        <Table className="wifi-data-table cctv-table">
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
            {error ? (
              <TableStateRow colSpan={columns.length}>
                <TableErrorState message={error} />
              </TableStateRow>
            ) : visibleRows.length === 0 && !isLoading ? (
              <TableStateRow colSpan={columns.length}>
                <TableEmptyState
                  title="No CCTV records found."
                  message="Try a different search term or switch CCTV sections."
                />
              </TableStateRow>
            ) : (
              visibleRows.map((row) => (
                <TableRow className="cctv-data-row" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className={cell.column.id === 'actions' ? 'table-action-column' : ''}
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="crud-pagination cctv-pagination">
        <p>
          Page {currentPage} of {pageCount} - showing {visibleRows.length} rows
        </p>
        <div className="pagination-actions">
          <Button
            aria-label="Previous page"
            disabled={currentPage <= 1 || isLoading}
            size="icon"
            type="button"
            variant="ghost"
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft aria-hidden="true" size={17} />
          </Button>
          <Badge variant="secondary">Page {currentPage}</Badge>
          <Button
            aria-label="Next page"
            disabled={currentPage >= pageCount || isLoading}
            size="icon"
            type="button"
            variant="ghost"
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight aria-hidden="true" size={17} />
          </Button>
        </div>
      </div>
    </>
  )
}

function textColumn(key: keyof CctvRecord, label: string): ColumnDef<CctvRecord> {
  return {
    accessorKey: key,
    header: ({ column }) => <SortButton column={column} label={label} />,
    cell: ({ getValue }) => <span>{String(getValue() ?? '') || 'Not set'}</span>,
  }
}

function copyColumn(key: keyof CctvRecord, label: string, copyLabel: string): ColumnDef<CctvRecord> {
  return {
    accessorKey: key,
    header: ({ column }) => <SortButton column={column} label={label} />,
    cell: ({ getValue }) => <CopyValue label={copyLabel} value={String(getValue() ?? '')} />,
  }
}

function statusColumn(): ColumnDef<CctvRecord> {
  return {
    accessorKey: 'status',
    header: ({ column }) => <SortButton column={column} label="Status" />,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
      className="wifi-sort-button cctv-sort-button"
      type="button"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ChevronsUpDown aria-hidden="true" size={14} />
    </button>
  )
}

function CopyValue({ value, label }: { value: string; label: string }) {
  function copyValue(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    if (value) {
      navigator.clipboard?.writeText(value)
    }
  }

  if (!value) {
    return <span className="secret-value">Not set</span>
  }

  return (
    <span className="copy-value cctv-copy-value">
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
  onToggle,
}: {
  value: string
  visible: boolean
  onToggle: () => void
}) {
  if (!value) {
    return <span className="secret-value cctv-password-missing">Missing</span>
  }

  return (
    <span className="secret-value cctv-secret-value">
      <span>{visible ? value : '••••••••'}</span>
      <button aria-label={visible ? 'Hide password' : 'Show password'} type="button" onClick={onToggle}>
        {visible ? <EyeOff aria-hidden="true" size={13} /> : <Eye aria-hidden="true" size={13} />}
      </button>
    </span>
  )
}

function StatusBadge({ status }: { status: CctvRecord['status'] }) {
  return (
    <Badge className="cctv-status-badge" variant={status === 'Online' ? 'success' : 'destructive'}>
      <span className={status === 'Online' ? 'status-dot online' : 'status-dot offline'} />
      {status}
    </Badge>
  )
}

export { CctvTable }
