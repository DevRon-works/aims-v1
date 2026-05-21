import * as React from 'react'
import { cn } from '../../lib/utils'

function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return <select className={cn('select', className)} {...props} />
}

export { Select }
