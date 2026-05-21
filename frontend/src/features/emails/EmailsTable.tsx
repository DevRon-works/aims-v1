import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  Eye,
  EyeOff,
  MoreHorizontal,
  Pencil,
  Trash2,
} from '../../lib/icons'
import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { EmailAccountRecord } from './emailsData'
import { useConfiguredTableColumns } from '../dynamic-tables/useConfiguredTableColumns'

type EmailsTableProps = {
  data: EmailAccountRecord[]
  isLoading: boolean
  error?: string | null
  canEdit: boolean
  canDelete: boolean
  canViewPasswords: boolean
  onDelete: (record: EmailAccountRecord) => void
  onEdit: (record: EmailAccountRecord) => void
  onView: (record: EmailAccountRecord) => void
  onSelect: (record: EmailAccountRecord) => void
}

function EmailsTable({
  data,
  isLoading,
  error,
  canEdit,
  canDelete,
  canViewPasswords,
  onDelete,
  onEdit,
  onView,
  onSelect,
}: EmailsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [passwordsVisible, setPasswordsVisible] = useState(false)

  const legacyColumns = useMemo<ColumnDef<EmailAccountRecord>[]>(
    () => [
      sortableColumn('emailsType', 'Emails Type'),
      copyColumn('emailAccount', 'Email Account', 'Copy email account'),
      {
        accessorKey: 'password',
        header: () => (
          <button
            className="wifi-password-toggle"
            type="button"
            onClick={() => setPasswordsVisible((current) => !current)}
          >
            Password
            {passwordsVisible ? <EyeOff aria-hidden="true" size={14} /> : <Eye aria-hidden="true" size={14} />}
          </button>
        ),
        cell: ({ row }) =>
          row.original.hasPassword ? (
            <MaskedSecret
              value={row.original.password ?? ''}
              visible={canViewPasswords && passwordsVisible && Boolean(row.original.password)}
            />
          ) : (
            <span className="copy-value copy-value-flagged">Missing</span>
          ),
      },
      sortableColumn('department', 'Department'),
      sortableColumn('personUsed', 'Person Used'),
      longTextColumn('purpose', 'Purpose'),
      copyColumn('recoveryEmail', 'Recovery Email', 'Copy recovery email'),
      longTextColumn('recoveryNumberVerification', 'Recovery Number & Verification'),
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
                  <MoreHorizontal aria-hidden="true" size={18} />
                  <span className="sr-only">Open row actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="row-action-menu z-50 w-44">
                <DropdownMenuItem onClick={() => onView(row.original)}>
                  <Eye aria-hidden="true" size={16} />
                  View Details
                </DropdownMenuItem>
                {canEdit ? (
                  <DropdownMenuItem onClick={() => onEdit(row.original)}>
                    <Pencil aria-hidden="true" size={16} />
                    Edit
                  </DropdownMenuItem>
                ) : null}
                {canDelete ? (
                  <DropdownMenuItem className="text-destructive" onClick={() => onDelete(row.original)}>
                    <Trash2 aria-hidden="true" size={16} />
                    Delete
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [canDelete, canEdit, canViewPasswords, onDelete, onEdit, onView, passwordsVisible],
  )

  const actionColumn = legacyColumns.find((column) => column.id === 'actions')
  const { columns, columnTools } = useConfiguredTableColumns({
    module: 'emails',
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
    initialState: { pagination: { pageSize: 8 } },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
  const visibleRows = table.getRowModel().rows

  return (
    <>
      <div className="wifi-table-utilities">
        <div className="wifi-table-count">
          <strong>{data.length}</strong>
          <span>email records</span>
        </div>
        {columnTools}
      </div>

      <div className="wifi-table-shell emails-table-shell">
        <Table className="wifi-data-table emails-table">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead className={header.column.id === 'actions' ? 'table-action-column' : ''} key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableStateRow colSpan={columns.length}>
                <TableLoadingState message="Loading email records..." />
              </TableStateRow>
            ) : error ? (
              <TableStateRow colSpan={columns.length}>
                <TableErrorState message={error} />
              </TableStateRow>
            ) : visibleRows.length === 0 ? (
              <TableStateRow colSpan={columns.length}>
                <TableEmptyState title="No email records found." />
              </TableStateRow>
            ) : (
              visibleRows.map((row) => (
                  <TableRow key={row.id} onClick={() => onSelect(row.original)}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell className={cell.column.id === 'actions' ? 'table-action-column' : ''} key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            )}
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

function sortableColumn(key: keyof EmailAccountRecord, label: string): ColumnDef<EmailAccountRecord> {
  return {
    accessorKey: key,
    header: ({ column }) => <SortButton column={column} label={label} />,
    cell: ({ getValue }) => <span>{String(getValue() ?? '') || 'Missing'}</span>,
  }
}

function longTextColumn(key: keyof EmailAccountRecord, label: string): ColumnDef<EmailAccountRecord> {
  return {
    accessorKey: key,
    header: ({ column }) => <SortButton column={column} label={label} />,
    cell: ({ getValue }) => <span className="email-long-cell">{String(getValue() ?? '') || 'Missing'}</span>,
  }
}

function copyColumn(
  key: keyof EmailAccountRecord,
  label: string,
  copyLabel: string,
): ColumnDef<EmailAccountRecord> {
  return {
    accessorKey: key,
    header: ({ column }) => <SortButton column={column} label={label} />,
    cell: ({ getValue }) => <CopyValue value={String(getValue() ?? '') || 'Missing'} label={copyLabel} />,
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
    <button className="wifi-sort-button" type="button" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      {label}
      <ChevronsUpDown aria-hidden="true" size={14} />
    </button>
  )
}

function CopyValue({ value, label }: { value: string; label: string }) {
  function copyValue(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    navigator.clipboard?.writeText(value)
  }

  return (
    <span className={value === 'Missing' ? 'copy-value copy-value-flagged' : 'copy-value'}>
      <span>{value}</span>
      {value !== 'Missing' ? (
        <button aria-label={label} type="button" onClick={copyValue}>
          <Copy aria-hidden="true" size={13} />
        </button>
      ) : null}
    </span>
  )
}

function MaskedSecret({ value, visible }: { value: string; visible: boolean }) {
  return visible ? (
    <CopyValue value={value} label="Copy password" />
  ) : (
    <span className="secret-value">
      Restricted
      <EyeOff aria-hidden="true" size={13} />
    </span>
  )
}

export { EmailsTable }
