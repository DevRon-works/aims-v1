import * as React from 'react'
import { cn } from '../../lib/utils'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'ghost'
  size?: 'default' | 'icon'
}

const variantClasses = {
  default: 'button button-default',
  ghost: 'button button-ghost',
}

const sizeClasses = {
  default: 'button-size-default',
  icon: 'button-size-icon',
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  )
}

export { Button }
