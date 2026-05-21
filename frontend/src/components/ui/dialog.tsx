import * as React from 'react'
import { X } from '../../lib/icons'
import { cn } from '../../lib/utils'

type DialogContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialog() {
  const context = React.useContext(DialogContext)

  if (!context) {
    throw new Error('Dialog components must be used within Dialog')
  }

  return context
}

type DialogProps = {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function Dialog({ children, open: controlledOpen, onOpenChange }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const nextOpen =
        typeof value === 'function' ? value(controlledOpen ?? uncontrolledOpen) : value

      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen)
      }

      onOpenChange?.(nextOpen)
    },
    [controlledOpen, onOpenChange, uncontrolledOpen],
  )

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDialog()

  return (
    <button
      className={cn('dialog-trigger', className)}
      onClick={(event) => {
        onClick?.(event)
        setOpen(true)
      }}
      type="button"
      {...props}
    />
  )
}

function DialogContent({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { open, setOpen } = useDialog()

  if (!open) {
    return null
  }

  return (
    <div className="dialog-overlay" role="presentation">
      <div
        aria-modal="true"
        className={cn('dialog-content', className)}
        role="dialog"
        {...props}
      >
        <button
          aria-label="Close dialog"
          className="dialog-close"
          onClick={() => setOpen(false)}
          type="button"
        >
          <X aria-hidden="true" size={17} />
        </button>
        {children}
      </div>
    </div>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('dialog-header', className)} {...props} />
}

function DialogTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 className={cn('dialog-title', className)} {...props} />
}

function DialogDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('dialog-description', className)} {...props} />
}

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}
