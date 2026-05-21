import * as React from 'react'
import { cn } from '../../lib/utils'

type DropdownMenuContextValue = {
  open: boolean
  setOpen: (value: React.SetStateAction<boolean>) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const DropdownMenuContext =
  React.createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext)

  if (!context) {
    throw new Error('DropdownMenu components must be used within DropdownMenu')
  }

  return context
}

function DropdownMenu({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const resolvedOpen = controlledOpen ?? open
  const setResolvedOpen = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const nextOpen =
        typeof value === 'function' ? value(controlledOpen ?? open) : value

      if (controlledOpen === undefined) {
        setOpen(nextOpen)
      }

      onOpenChange?.(nextOpen)
    },
    [controlledOpen, onOpenChange, open],
  )

  React.useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setResolvedOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setResolvedOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [setResolvedOpen])

  return (
    <DropdownMenuContext.Provider
      value={{ open: resolvedOpen, setOpen: setResolvedOpen, triggerRef }}
    >
      <div className="dropdown-menu-root" ref={menuRef}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

type DropdownMenuTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

function DropdownMenuTrigger({
  asChild = false,
  children,
  className,
  onClick,
  ...props
}: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownMenu()

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    setOpen((current) => !current)
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>

    return React.cloneElement(child, {
      ...props,
      'aria-expanded': open,
      'aria-haspopup': 'menu',
      className: cn('dropdown-menu-trigger', child.props.className, className),
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        child.props.onClick?.(event)
        handleClick(event)
      },
      ref: triggerRef,
    } as React.ButtonHTMLAttributes<HTMLButtonElement> & {
      ref: React.RefObject<HTMLButtonElement | null>
    })
  }

  return (
    <button
      aria-expanded={open}
      aria-haspopup="menu"
      className={cn('dropdown-menu-trigger', className)}
      onClick={handleClick}
      ref={triggerRef}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}

type DropdownMenuContentProps = React.ComponentProps<'div'> & {
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
}

function DropdownMenuContent({
  align = 'end',
  className,
  side = 'bottom',
  sideOffset = 8,
  style,
  ...props
}: DropdownMenuContentProps) {
  const { open, triggerRef } = useDropdownMenu()
  const [position, setPosition] = React.useState<React.CSSProperties>({})

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return
    }

    const rect = triggerRef.current.getBoundingClientRect()
    const offset = sideOffset
    const nextPosition: React.CSSProperties = {
      position: 'fixed',
      top: side === 'top' ? 'auto' : rect.bottom + offset,
      bottom: side === 'top' ? window.innerHeight - rect.top + offset : 'auto',
      zIndex: 50,
    }

    if (align === 'start') {
      nextPosition.left = rect.left
    } else if (align === 'center') {
      nextPosition.left = rect.left + rect.width / 2
      nextPosition.transform = 'translateX(-50%)'
    } else {
      nextPosition.right = window.innerWidth - rect.right
    }

    setPosition(nextPosition)
  }, [align, open, side, sideOffset, triggerRef])

  if (!open) {
    return null
  }

  return (
    <div
      className={cn(
        'dropdown-menu-content',
        `dropdown-menu-side-${side}`,
        `dropdown-menu-align-${align}`,
        className,
      )}
      role="menu"
      style={{ '--dropdown-side-offset': `${sideOffset}px`, ...position, ...style } as React.CSSProperties}
      {...props}
    />
  )
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function DropdownMenuItem({
  className,
  onClick,
  ...props
}: React.ComponentProps<'button'>) {
  const { setOpen } = useDropdownMenu()

  return (
    <button
      className={cn('dropdown-menu-item', className)}
      onClick={(event) => {
        onClick?.(event)
        setOpen(false)
      }}
      role="menuitem"
      type="button"
      {...props}
    />
  )
}

function DropdownMenuLink({
  className,
  onClick,
  ...props
}: React.ComponentProps<'a'>) {
  const { setOpen } = useDropdownMenu()

  return (
    <a
      className={cn('dropdown-menu-item', className)}
      onClick={(event) => {
        onClick?.(event)
        setOpen(false)
      }}
      role="menuitem"
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn('dropdown-menu-separator', className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLink,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
}
