import * as React from 'react'
import { Check } from '../../lib/icons'
import { cn } from '../../lib/utils'

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, ...props }, ref) => {
    return (
      <span className="checkbox-control">
        <input
          ref={ref}
          type="checkbox"
          className={cn('checkbox-input', className)}
          checked={checked}
          {...props}
        />
        <span aria-hidden="true" className="checkbox-box">
          <Check className="checkbox-icon" />
        </span>
      </span>
    )
  },
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
