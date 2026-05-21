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
  ExternalLink,
  MoreHorizontal,
  Pencil,
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
import type { AccountRecord } from './accountsData'
import { useConfiguredTableColumns } from '../dynamic-tables/useConfiguredTableColumns'

type AccountsTableProps = {
  data: AccountRecord[]
  isLoading: boolean
  error?: string | null
  section: 'Store Account' | 'PLDT Internet' | 'Link Account'
  canEdit: boolean
  canDelete: boolean
  canViewAccountNumbers: boolean
  onDelete: (record: AccountRecord) => void
  onEdit: (record: AccountRecord) => void
  onView: (record: AccountRecord) => void
  onSelect: (record: AccountRecord) => void
}

function AccountsTable({
  data,
  isLoading,
  error,
  section,
  canEdit,
  canDelete,
  canViewAccountNumbers,
  onDelete,
  onEdit,
  onView,
  onSelect,
}: AccountsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [numbersVisible, setNumbersVisible] = useState(false)
  const [passwordsVisible, setPasswordsVisible] = useState(false)
  const accountNumberColumn: ColumnDef<AccountRecord> = {
    accessorKey: 'accountNumber',
    header: () => (
      <button
        className="wifi-password-toggle"
        type="button"
        onClick={() => setNumbersVisible((current) => !current)}
      >
        {section === 'Store Account' ? 'Account #' : 'Account Number'}
        {numbersVisible ? (
          <EyeOff aria-hidden="true" size={14} />
        ) : (
          <Eye aria-hidden="true" size={14} />
        )}
      </button>
    ),
    cell: ({ row }) => (
      <MaskedAccountNumber
        flagged={row.original.duplicateAccountNumber || row.original.missingFields?.includes('Account #') || row.original.missingFields?.includes('Account Number')}
        value={row.original.accountNumber || 'Missing'}
        visible={canViewAccountNumbers && numbersVisible}
      />
    ),
  }
  const actionColumn: ColumnDef<AccountRecord> = {
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  }
  const legacyColumns = useMemo<ColumnDef<AccountRecord>[]>(
    () =>
      section === 'Link Account'
        ? [
            sortableColumn('department', 'Department'),
            copyColumn('email', 'Email', 'Copy email'),
            copyColumn('username', 'Username', 'Copy username'),
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
                  <MaskedPassword
                    value={row.original.password}
                    visible={canViewAccountNumbers && passwordsVisible}
                  />
                ) : (
                  <span className="copy-value copy-value-flagged">Missing</span>
                ),
            },
            linkColumn(),
            statusColumn(),
            sortableColumn('notes', 'Notes'),
            sortableColumn('lastUpdated', 'Last Updated'),
            sortableColumn('updatedBy', 'Updated By'),
            actionColumn,
          ]
        : section === 'Store Account'
        ? [
            sortableColumn('merchantName', 'Merchant Name'),
            sortableColumn('storeLocationName', 'Store Location Name'),
            sortableColumn('storeAddress', 'Store Address'),
            sortableColumn('storeManager', 'Store Manager'),
            copyColumn('storeEmail', 'Store Email', 'Copy store email'),
            copyColumn('storeContactNumber', 'Store Contact #', 'Copy contact number'),
            sortableColumn('bank', 'Bank'),
            sortableColumn('accountName', 'Account Name'),
            accountNumberColumn,
            statusColumn(),
            sortableColumn('notes', 'Notes'),
            sortableColumn('lastUpdated', 'Last Updated'),
            sortableColumn('updatedBy', 'Updated By'),
            actionColumn,
          ]
        : [
            sortableColumn('company', 'Company'),
            sortableColumn('branch', 'Branch'),
            statusColumn(),
            sortableColumn('remarks', 'Remarks'),
            sortableColumn('check', 'Check'),
            sortableColumn('companyAccount', 'Company Account'),
            accountNumberColumn,
            sortableColumn('notes', 'Notes'),
            sortableColumn('lastUpdated', 'Last Updated'),
            sortableColumn('updatedBy', 'Updated By'),
            actionColumn,
          ],
    [accountNumberColumn, actionColumn, canViewAccountNumbers, passwordsVisible, section],
  )
  const schemaModule =
    section === 'Store Account'
      ? 'accounts-store'
      : section === 'PLDT Internet'
        ? 'accounts-pldt'
        : 'accounts-links'
  const { columns, columnTools } = useConfiguredTableColumns({
    module: schemaModule,
    dataColumns: legacyColumns.filter((column) => column.id !== 'actions'),
    actionColumn,
    canViewPasswords: canViewAccountNumbers,
    onValuesSaved: (record, values) => {
      record.customFields = values
    },
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
          <span>filtered account records</span>
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

      <div className="wifi-table-shell accounts-table-shell">
        <Table className="wifi-data-table accounts-table">
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
                <TableLoadingState message="Loading account records..." />
              </TableStateRow>
            ) : error ? (
              <TableStateRow colSpan={columns.length}>
                <TableErrorState message={error} />
              </TableStateRow>
            ) : visibleRows.length === 0 ? (
              <TableStateRow colSpan={columns.length}>
                <TableEmptyState title="No account records found." />
              </TableStateRow>
            ) : visibleRows.map((row) => (
              <TableRow
                className={
                  row.original.status === 'Missing Details' ||
                  row.original.duplicateAccountNumber ||
                  row.original.missingLink ||
                  row.original.invalidUrl ||
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

function sortableColumn(key: keyof AccountRecord, label: string): ColumnDef<AccountRecord> {
  return {
    accessorKey: key,
    header: ({ column }) => <SortButton column={column} label={label} />,
    cell: ({ getValue }) => <span>{String(getValue() ?? '') || 'Missing'}</span>,
  }
}

function copyColumn(
  key: keyof AccountRecord,
  label: string,
  copyLabel: string,
): ColumnDef<AccountRecord> {
  return {
    accessorKey: key,
    header: ({ column }) => <SortButton column={column} label={label} />,
    cell: ({ getValue }) => <CopyValue value={String(getValue() ?? '') || 'Missing'} label={copyLabel} />,
  }
}

function linkColumn(): ColumnDef<AccountRecord> {
  return {
    accessorKey: 'link',
    header: ({ column }) => <SortButton column={column} label="Link" />,
    cell: ({ row }) => {
      if (!row.original.link) {
        return <span className="copy-value copy-value-flagged">Missing</span>
      }

      if (row.original.invalidUrl) {
        return <span className="copy-value copy-value-flagged">Invalid URL</span>
      }

      return (
        <button
          className="link-button-cell"
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            window.open(row.original.link, '_blank')
          }}
        >
          <ExternalLink aria-hidden="true" size={13} />
          Open
        </button>
      )
    },
  }
}

function statusColumn(): ColumnDef<AccountRecord> {
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
      className="wifi-sort-button"
      type="button"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ChevronsUpDown aria-hidden="true" size={14} />
    </button>
  )
}

function CopyValue({ value, label, flagged = false }: { value: string; label: string; flagged?: boolean }) {
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

function MaskedAccountNumber({
  value,
  visible,
  flagged,
}: {
  value: string
  visible: boolean
  flagged?: boolean
}) {
  const masked =
    value === 'Missing' ? 'Missing' : `${'*'.repeat(8)}${value.slice(Math.max(0, value.length - 4))}`

  return <CopyValue flagged={flagged} value={visible ? value : masked} label="Copy account number" />
}

function MaskedPassword({ value, visible }: { value: string; visible: boolean }) {
  return visible ? (
    <CopyValue value={value} label="Copy password" />
  ) : (
    <span className="secret-value">
      Encrypted
      <EyeOff aria-hidden="true" size={13} />
    </span>
  )
}

function StatusBadge({ status }: { status: AccountRecord['status'] }) {
  const variant =
    status === 'Active' || status === 'Updated'
      ? 'success'
      : status === 'Closed' || status === 'Inactive' || status === 'Disabled'
        ? 'secondary'
        : status === 'Expired'
          ? 'destructive'
        : 'warning'

  return <Badge variant={variant}>{status}</Badge>
}

export { AccountsTable }
