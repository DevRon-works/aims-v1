import * as React from 'react'
import { cn } from '../../lib/utils'

function Avatar({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('avatar', className)} {...props} />
}

function AvatarImage({ className, ...props }: React.ComponentProps<'img'>) {
  if (!props.src) {
    return null
  }

  return <img className={cn('avatar-image', className)} {...props} />
}

function AvatarFallback({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('avatar-fallback', className)} {...props} />
}

export { Avatar, AvatarFallback, AvatarImage }
