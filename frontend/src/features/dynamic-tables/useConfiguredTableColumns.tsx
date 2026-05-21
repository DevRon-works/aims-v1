import type { ColumnDef } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { useAuth } from '../../contexts/AuthContext'
import {
  tableSchemasApi,
  type DynamicColumnPayload,
  type DynamicFieldType,
  type DynamicTableColumn,
} from '../../services/api/tableSchemasApi'

type ConfiguredRecord = {
  id: string
  customFields?: Record<string, unknown>
  [key: string]: unknown
}

type Options<T extends ConfiguredRecord> = {
  module: string
  dataColumns: ColumnDef<T>[]
  actionColumn?: ColumnDef<T>
  canViewPasswords?: boolean
  onValuesSaved?: (record: T, values: Record<string, unknown>) => void
}

const fieldTypes: DynamicFieldType[] = [
  'text',
  'number',
  'email',
  'password',
  'date',
  'select',
  'textarea',
  'boolean',
  'status',
  'notes',
]

function useConfiguredTableColumns<T extends ConfiguredRecord>({
  module,
  dataColumns,
  actionColumn,
  canViewPasswords = false,
  onValuesSaved,
}: Options<T>) {
  const { user } = useAuth() as { user?: { role?: string } | null }
  const [schemaColumns, setSchemaColumns] = useState<DynamicTableColumn[]>([])
  const [isLoadingSchema, setIsLoadingSchema] = useState(true)
  const isSuperAdmin = ['Super Admin', 'Super Administrator'].includes(user?.role ?? '')

  const refresh = useCallback(async () => {
    setIsLoadingSchema(true)

    try {
      setSchemaColumns(await tableSchemasApi.columns(module))
    } finally {
      setIsLoadingSchema(false)
    }
  }, [module])

  useEffect(() => {
    refresh().catch(() => setSchemaColumns([]))
  }, [refresh])

  const columns = useMemo<ColumnDef<T>[]>(() => {
    const localColumns = new Map(
      dataColumns.map((column) => [String(column.id ?? ('accessorKey' in column ? column.accessorKey : '')), column]),
    )
    const configured = schemaColumns
      .filter((column) => !column.is_hidden)
      .map((column) => {
        const local = localColumns.get(column.key)

        if (local && !column.is_custom) {
          return { ...local, id: column.key }
        }

        return {
          id: column.key,
          accessorFn: (row) =>
            column.is_custom ? row.customFields?.[column.key] : row[column.key],
          header: column.label,
          cell: ({ row, getValue }) =>
            column.is_custom ? (
              <CustomValueCell
                column={column}
                record={row.original}
                value={getValue()}
                onSaved={onValuesSaved}
              />
            ) : (
              <FieldValue
                canViewPasswords={canViewPasswords}
                type={column.field_type}
                value={getValue()}
              />
            ),
        } satisfies ColumnDef<T>
      })

    return actionColumn ? [...configured, actionColumn] : configured
  }, [actionColumn, canViewPasswords, dataColumns, onValuesSaved, schemaColumns])

  return {
    columns,
    columnTools: (
      <ColumnManager
        columns={schemaColumns}
        isLoading={isLoadingSchema}
        isSuperAdmin={isSuperAdmin}
        module={module}
        onChanged={refresh}
      />
    ),
  }
}

function useTableSchema(module: string) {
  const [columns, setColumns] = useState<DynamicTableColumn[]>([])

  useEffect(() => {
    tableSchemasApi
      .columns(module)
      .then(setColumns)
      .catch(() => setColumns([]))
  }, [module])

  return columns.filter((column) => !column.is_hidden)
}

function TableColumnEditorButton({ module }: { module: string }) {
  const { user } = useAuth() as { user?: { role?: string } | null }
  const [columns, setColumns] = useState<DynamicTableColumn[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      setColumns(await tableSchemasApi.columns(module))
    } finally {
      setIsLoading(false)
    }
  }, [module])

  useEffect(() => {
    refresh().catch(() => setColumns([]))
  }, [refresh])

  return (
    <ColumnManager
      columns={columns}
      isLoading={isLoading}
      isSuperAdmin={['Super Admin', 'Super Administrator'].includes(user?.role ?? '')}
      module={module}
      onChanged={refresh}
    />
  )
}

function FieldValue({
  canViewPasswords,
  type,
  value,
}: {
  canViewPasswords: boolean
  type: DynamicFieldType
  value: unknown
}) {
  if (value === null || value === undefined || value === '') {
    return <span>Not set</span>
  }

  if (type === 'boolean') {
    return <Badge variant={value ? 'success' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>
  }

  if (type === 'status') {
    return <Badge variant="secondary">{String(value)}</Badge>
  }

  if (type === 'password') {
    return <span className="secret-value">{canViewPasswords ? String(value) : 'Restricted'}</span>
  }

  return <span>{String(value)}</span>
}

function ColumnManager({
  columns,
  isLoading,
  isSuperAdmin,
  module,
  onChanged,
}: {
  columns: DynamicTableColumn[]
  isLoading: boolean
  isSuperAdmin: boolean
  module: string
  onChanged: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<DynamicTableColumn | null>(null)
  const [adding, setAdding] = useState(false)

  async function move(column: DynamicTableColumn, offset: number) {
    await tableSchemasApi.updateColumn(module, column.id, {
      label: column.label,
      field_type: column.field_type,
      sort_order: Math.max(0, column.sort_order + offset),
    })
    await onChanged()
  }

  async function toggleHidden(column: DynamicTableColumn) {
    await tableSchemasApi.updateColumn(module, column.id, {
      label: column.label,
      field_type: column.field_type,
      is_hidden: !column.is_hidden,
    })
    await onChanged()
  }

  async function remove(column: DynamicTableColumn) {
    await tableSchemasApi.deleteColumn(module, column.id)
    toast.success('Column deleted.')
    await onChanged()
  }

  return (
    <>
      <Button disabled={isLoading} type="button" variant="ghost" onClick={() => setOpen(true)}>
        Edit Columns
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="record-dialog dynamic-columns-dialog">
          <DialogHeader>
            <DialogTitle>Table Columns</DialogTitle>
            <DialogDescription>Backend columns for this module.</DialogDescription>
          </DialogHeader>
          <div className="dynamic-column-list">
            {columns.map((column) => (
              <div className="dynamic-column-row" key={column.id}>
                <div>
                  <strong>{column.label}</strong>
                  <span>{column.field_type}{column.is_protected ? ' / protected' : ''}</span>
                </div>
                <div className="dynamic-column-actions">
                  {column.is_hidden ? <Badge variant="secondary">Hidden</Badge> : null}
                  <Button disabled={!isSuperAdmin} size="icon" type="button" variant="ghost" onClick={() => move(column, -15)}>
                    Up
                  </Button>
                  <Button disabled={!isSuperAdmin} size="icon" type="button" variant="ghost" onClick={() => move(column, 15)}>
                    Down
                  </Button>
                  <Button disabled={!isSuperAdmin} type="button" variant="ghost" onClick={() => toggleHidden(column)}>
                    {column.is_hidden ? 'Show' : 'Hide'}
                  </Button>
                  <Button disabled={!isSuperAdmin || column.is_protected} type="button" variant="ghost" onClick={() => setEditing(column)}>
                    Rename
                  </Button>
                  <Button disabled={!isSuperAdmin || column.is_protected} type="button" variant="ghost" onClick={() => remove(column)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <Button disabled={!isSuperAdmin} type="button" onClick={() => setAdding(true)}>
              Add Custom Column
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ColumnForm
        column={editing}
        module={module}
        open={adding || Boolean(editing)}
        onChanged={onChanged}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setAdding(false)
            setEditing(null)
          }
        }}
      />
    </>
  )
}

function ColumnForm({
  column,
  module,
  open,
  onChanged,
  onOpenChange,
}: {
  column: DynamicTableColumn | null
  module: string
  open: boolean
  onChanged: () => Promise<void>
  onOpenChange: (open: boolean) => void
}) {
  const [form, setForm] = useState<DynamicColumnPayload>({})

  useEffect(() => {
    setForm(column ? column : {
      label: '',
      key: '',
      field_type: 'text',
      options: [],
      is_required: false,
    })
  }, [column, open])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const options = Array.isArray(form.options) ? form.options.join(',') : ''
    const payload = {
      ...form,
      options: options
        .split(',')
        .map((option) => option.trim())
        .filter(Boolean),
    }

    if (column) {
      await tableSchemasApi.updateColumn(module, column.id, payload)
      toast.success('Column updated.')
    } else {
      await tableSchemasApi.createColumn(module, payload)
      toast.success('Custom column added.')
    }

    await onChanged()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="record-dialog">
        <DialogHeader>
          <DialogTitle>{column ? 'Edit Column' : 'Add Custom Column'}</DialogTitle>
          <DialogDescription>Validation follows the field type selected here.</DialogDescription>
        </DialogHeader>
        <form className="modal-form" onSubmit={submit}>
          <Label>Label<Input value={String(form.label ?? '')} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} /></Label>
          {!column ? <Label>Key<Input value={String(form.key ?? '')} onChange={(event) => setForm((current) => ({ ...current, key: event.target.value }))} /></Label> : null}
          <Label>Field Type
            <Select value={String(form.field_type ?? 'text')} onChange={(event) => setForm((current) => ({ ...current, field_type: event.target.value as DynamicFieldType }))}>
              {fieldTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </Select>
          </Label>
          {form.field_type === 'select' ? (
            <Label>Options<Input value={(form.options ?? []).join(', ')} onChange={(event) => setForm((current) => ({ ...current, options: event.target.value.split(',') }))} /></Label>
          ) : null}
          <Label className="settings-toggle-row">
            <Checkbox checked={Boolean(form.is_required)} onChange={(event) => setForm((current) => ({ ...current, is_required: event.target.checked }))} />
            <span><strong>Required value</strong></span>
          </Label>
          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Column</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CustomValueCell<T extends ConfiguredRecord>({
  column,
  record,
  value,
  onSaved,
}: {
  column: DynamicTableColumn
  record: T
  value: unknown
  onSaved?: (record: T, values: Record<string, unknown>) => void
}) {
  const [open, setOpen] = useState(false)
  const [nextValue, setNextValue] = useState<unknown>(value ?? '')
  const [currentValue, setCurrentValue] = useState<unknown>(value)

  useEffect(() => {
    setNextValue(value ?? '')
    setCurrentValue(value)
  }, [value])

  async function save() {
    const response = await tableSchemasApi.updateValues(column.module, record.id, {
      [column.key]: nextValue,
    })
    toast.success('Custom value saved.')
    onSaved?.(record, response.data?.data ?? {})
    setCurrentValue(response.data?.data?.[column.key] ?? nextValue)
    setOpen(false)
  }

  return (
    <>
      <button className="dynamic-value-trigger" type="button" onClick={(event) => {
        event.stopPropagation()
        setOpen(true)
      }}>
        <FieldValue canViewPasswords={false} type={column.field_type} value={currentValue} />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="record-dialog">
          <DialogHeader>
            <DialogTitle>{column.label}</DialogTitle>
            <DialogDescription>Update this custom value for the selected record.</DialogDescription>
          </DialogHeader>
          <div className="modal-form">
            <DynamicValueInput column={column} value={nextValue} onChange={setNextValue} />
            <div className="modal-actions">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="button" onClick={save}>Save Value</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function DynamicValueInput({
  column,
  value,
  onChange,
}: {
  column: DynamicTableColumn
  value: unknown
  onChange: (value: unknown) => void
}) {
  if (column.field_type === 'boolean') {
    return <Label className="settings-toggle-row"><Checkbox checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} /><span><strong>{column.label}</strong></span></Label>
  }

  if (column.field_type === 'select') {
    return <Select value={String(value ?? '')} onChange={(event) => onChange(event.target.value)}>{(column.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}</Select>
  }

  if (['textarea', 'notes'].includes(column.field_type)) {
    return <Textarea value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />
  }

  return <Input type={column.field_type === 'number' ? 'number' : column.field_type === 'date' ? 'date' : column.field_type === 'password' ? 'password' : column.field_type === 'email' ? 'email' : 'text'} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />
}

export { TableColumnEditorButton, useConfiguredTableColumns, useTableSchema }
