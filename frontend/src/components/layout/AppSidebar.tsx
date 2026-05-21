import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronDown, X } from '../../lib/icons'
import { Button } from '../ui/button'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useSystemSettings } from '../../contexts/SystemSettingsContext.jsx'
import { cn } from '../../lib/utils'
import { navigationGroups } from './navigation'
import { resourceKeyFromPath } from '../../services/permissionService'
import { SidebarUserDropdown } from './SidebarUserDropdown'

type AppSidebarProps = {
  isOpen: boolean
  onClose: () => void
}

function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const { can } = useAuth() as {
    can: (resource: string, action: string) => boolean
  }
  const { settings } = useSystemSettings() as {
    settings: {
      hiddenSidebarPaths: string[]
      logoDataUrl: string
      showSidebarGroups: boolean
      sidebarDensity: string
      sidebarVariant: string
      systemName: string
      systemSubtitle: string
    }
  }
  const logoSrc = settings.logoDataUrl || '/favicon.svg'
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Overview: true,
    Network: true,
    Business: true,
    Administration: true,
  })

  function toggleGroup(label: string) {
    setOpenGroups((current) => ({ ...current, [label]: !current[label] }))
  }

  return (
    <>
      <div
        className={cn('sidebar-scrim', isOpen && 'sidebar-scrim-open')}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'app-sidebar',
          isOpen && 'app-sidebar-open',
          settings.sidebarDensity === 'compact' && 'app-sidebar-compact',
          settings.sidebarVariant === 'compact' && 'app-sidebar-brand-compact',
        )}
      >
        <div className="sidebar-card">
          <div className="sidebar-brand">
            <div className="brand-mark sidebar-brand-mark">
              <img alt="" src={logoSrc} />
            </div>
            <div>
              <p className="brand-kicker">{settings.systemName}</p>
              <p className="brand-name">{settings.systemSubtitle}</p>
            </div>
            {isOpen ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="sidebar-close"
                aria-label="Close navigation"
                onClick={onClose}
              >
                <X aria-hidden="true" size={18} />
              </Button>
            ) : null}
          </div>

          <nav className="sidebar-nav" aria-label="Main navigation">
            {navigationGroups.map((group) => {
              const permittedItems = group.items.filter(
                (item) =>
                  !item.hidden &&
                  can(resourceKeyFromPath(item.path), 'view') &&
                  !settings.hiddenSidebarPaths.includes(item.path),
              )
              const isExpanded = openGroups[group.label]

              if (permittedItems.length === 0) {
                return null
              }

              return (
                <section className="sidebar-group" key={group.label}>
                  {settings.showSidebarGroups ? (
                    <button
                      type="button"
                      className="sidebar-group-trigger"
                      aria-expanded={isExpanded}
                      onClick={() => toggleGroup(group.label)}
                    >
                      <span>{group.label}</span>
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          'group-chevron',
                          isExpanded && 'group-chevron-open',
                        )}
                        size={15}
                      />
                    </button>
                  ) : null}

                  <div
                    className={cn(
                      'sidebar-group-items',
                      (isExpanded || !settings.showSidebarGroups) &&
                        'sidebar-group-items-open',
                    )}
                  >
                    <div className="sidebar-group-inner">
                      {permittedItems.map((item) => {
                        const Icon = item.icon

                        return (
                          <NavLink
                            className={({ isActive }) =>
                              cn(
                                'sidebar-item',
                                isActive && 'sidebar-item-active',
                              )
                            }
                            end={item.path === '/dashboard'}
                            key={item.path}
                            onClick={onClose}
                            to={item.path}
                          >
                            <Icon aria-hidden="true" size={18} />
                            <span>{item.label}</span>
                          </NavLink>
                        )
                      })}
                    </div>
                  </div>
                </section>
              )
            })}
          </nav>
          <SidebarUserDropdown onNavigate={onClose} />
        </div>
      </aside>
    </>
  )
}

export { AppSidebar }
