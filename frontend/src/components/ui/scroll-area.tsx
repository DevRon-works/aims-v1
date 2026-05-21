import * as React from 'react'
import { cn } from '../../lib/utils'

function ScrollArea({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('scroll-area', className)} {...props} />
}

export { ScrollArea }
