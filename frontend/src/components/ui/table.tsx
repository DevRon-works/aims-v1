import * as React from 'react'
import { cn } from '../../lib/utils'

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="table-wrapper">
      <table className={cn('table', className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead className={cn('table-header', className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody className={cn('table-body', className)} {...props} />
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return <tr className={cn('table-row', className)} {...props} />
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return <th className={cn('table-head', className)} {...props} />
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return <td className={cn('table-cell', className)} {...props} />
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow }
