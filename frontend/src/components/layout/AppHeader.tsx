import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Menu,
  Search,
} from '../../lib/icons'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import { useSystemSettings } from '../../contexts/SystemSettingsContext.jsx'

type AppHeaderProps = {
  breadcrumbs: string[]
  isSidebarOpen: boolean
  title: string
  onOpenSidebar: () => void
}

const notifications = [
  {
    icon: AlertTriangle,
    tone: 'warning',
    title: 'VPN tunnel latency elevated',
    meta: 'Network monitoring - 8 min ago',
  },
  {
    icon: CheckCircle2,
    tone: 'success',
    title: 'Daily backup completed',
    meta: 'Infrastructure - 22 min ago',
  },
  {
    icon: Clock3,
    tone: 'default',
    title: 'Access review due today',
    meta: 'Administration - 1 hr ago',
  },
]

function AppHeader({
  breadcrumbs,
  isSidebarOpen,
  title,
  onOpenSidebar,
}: AppHeaderProps) {
  const { settings } = useSystemSettings() as {
    settings: { notifyInApp: boolean }
  }

  return (
    <header className="app-header">
      <div className="header-title-row">
        {!isSidebarOpen ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mobile-menu-button lg:hidden"
            aria-label="Open navigation"
            onClick={onOpenSidebar}
          >
            <Menu aria-hidden="true" size={20} />
          </Button>
        ) : null}
        <div className="header-title-stack">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <span className="breadcrumb-item" key={`${crumb}-${index}`}>
                {index > 0 ? <span className="breadcrumb-separator">/</span> : null}
                <span>{crumb}</span>
              </span>
            ))}
          </nav>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="header-actions">
        <div className="header-search">
          <Search aria-hidden="true" className="header-search-icon" size={17} />
          <Input
            aria-label="Search"
            className="header-search-input"
            placeholder="Search modules, users, assets"
            type="search"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="button button-ghost button-size-icon notification-button"
            aria-label="Notifications"
          >
            <Bell aria-hidden="true" size={19} />
            {settings.notifyInApp ? (
              <span className="notification-dot" aria-hidden="true" />
            ) : null}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="notifications-dropdown">
            <div className="dropdown-menu-label notifications-header">
              <span className="user-name">Notifications</span>
              <span className="user-role">3 unread operational updates</span>
            </div>
            <DropdownMenuSeparator />
            <div className="notification-list" role="none">
              {notifications.map((notification) => {
                const Icon = notification.icon

                return (
                  <DropdownMenuItem
                    className="notification-item"
                    key={notification.title}
                  >
                    <span
                      className={`notification-icon notification-icon-${notification.tone}`}
                    >
                      <Icon aria-hidden="true" size={16} />
                    </span>
                    <span className="notification-copy">
                      <span className="notification-title">
                        {notification.title}
                      </span>
                      <span className="notification-meta">
                        {notification.meta}
                      </span>
                    </span>
                  </DropdownMenuItem>
                )
              })}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="notification-view-all">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export { AppHeader }
