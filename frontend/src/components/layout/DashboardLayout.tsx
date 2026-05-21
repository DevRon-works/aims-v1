import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { navigationGroups, navigationItems } from './navigation'
import { useSystemSettings } from '../../contexts/SystemSettingsContext.jsx'
import { PageShell } from './PageLayout'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { getProfileForUser } from '../../features/profile/profileData'
import { useTheme } from '../../contexts/ThemeContext.jsx'

type DashboardLayoutProps = {
  children?: ReactNode
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { settings } = useSystemSettings() as {
    settings: { systemName: string }
  }
  const { mode, setMode } = useTheme() as {
    mode: string
    setMode: (mode: string) => void
  }
  const { user } = useAuth() as {
    user: {
      avatar_url?: string
      email?: string
      id?: string
      name?: string
      role?: string
      username?: string
    } | null
  }
  const location = useLocation()
  const currentPage =
    navigationItems.find((item) => item.path === location.pathname) ??
    navigationItems[0]
  const currentGroup =
    navigationGroups.find((group) =>
      group.items.some((item) => item.path === currentPage.path),
    )?.label ?? 'Overview'

  useEffect(() => {
    if (!user) {
      return
    }

    const profile = getProfileForUser(user)
    if (mode !== profile.themeMode) {
      setMode(profile.themeMode)
    }
  }, [mode, setMode, user])

  return (
    <div className="dashboard-shell">
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="dashboard-main">
        <AppHeader
          breadcrumbs={[settings.systemName, currentGroup, currentPage.label]}
          isSidebarOpen={isSidebarOpen}
          title={currentPage.label}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
        <main className="dashboard-content">
          <PageShell>{children ?? <Outlet />}</PageShell>
        </main>
      </div>
    </div>
  )
}

export { DashboardLayout }
