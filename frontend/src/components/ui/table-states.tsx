import type { ReactNode } from 'react'
import { AlertTriangle, LoaderCircle, Search } from '../../lib/icons'
import { TableCell, TableRow } from './table'

type TableStateProps = {
  title?: string
  message?: string
}

type TableStateRowProps = {
  children: ReactNode
  colSpan: number
}

function TableLoadingState({ message = 'Loading records...' }: TableStateProps) {
  return (
    <div aria-live="polite" className="table-state table-state-loading" role="status">
      <LoaderCircle aria-hidden="true" className="table-state-icon table-state-spinner" />
      <p className="table-state-title">{message}</p>
    </div>
  )
}

function TableEmptyState({
  title = 'No records found',
  message = 'Try changing your search or filter criteria.',
}: TableStateProps) {
  return (
    <div className="table-state">
      <Search aria-hidden="true" className="table-state-icon" />
      <p className="table-state-title">{title}</p>
      {message ? <p className="table-state-message">{message}</p> : null}
    </div>
  )
}

function TableErrorState({
  title = 'Unable to load records',
  message = 'Please refresh and try again.',
}: TableStateProps) {
  return (
    <div className="table-state table-state-error" role="alert">
      <AlertTriangle aria-hidden="true" className="table-state-icon" />
      <p className="table-state-title">{title}</p>
      {message ? <p className="table-state-message">{message}</p> : null}
    </div>
  )
}

function TableStateRow({ children, colSpan }: TableStateRowProps) {
  return (
    <TableRow>
      <TableCell className="table-state-cell" colSpan={colSpan}>
        {children}
      </TableCell>
    </TableRow>
  )
}

export { TableEmptyState, TableErrorState, TableLoadingState, TableStateRow }
