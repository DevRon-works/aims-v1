import * as React from 'react'
import { cn } from '../../lib/utils'

type TabsContextValue = {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabs() {
  const context = React.useContext(TabsContext)

  if (!context) {
    throw new Error('Tabs components must be used within Tabs')
  }

  return context
}

type TabsProps = React.ComponentProps<'div'> & {
  value: string
  onValueChange: (value: string) => void
}

function Tabs({ className, value, onValueChange, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('tabs', className)} {...props} />
    </TabsContext.Provider>
  )
}

function TabsList({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('tabs-list', className)} role="tablist" {...props} />
}

type TabsTriggerProps = React.ComponentProps<'button'> & {
  value: string
}

function TabsTrigger({ className, value, onClick, ...props }: TabsTriggerProps) {
  const tabs = useTabs()
  const active = tabs.value === value

  return (
    <button
      aria-selected={active}
      className={cn('tabs-trigger', active && 'tabs-trigger-active', className)}
      role="tab"
      type="button"
      onClick={(event) => {
        onClick?.(event)
        tabs.onValueChange(value)
      }}
      {...props}
    />
  )
}

type TabsContentProps = React.ComponentProps<'div'> & {
  value: string
}

function TabsContent({ className, value, ...props }: TabsContentProps) {
  const tabs = useTabs()

  if (tabs.value !== value) {
    return null
  }

  return (
    <div
      className={cn('tabs-content', className)}
      role="tabpanel"
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
