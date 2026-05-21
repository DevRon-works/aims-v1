import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useSystemSettings } from '../contexts/SystemSettingsContext.jsx'
import {
  getDefaultLandingRouteForUser,
  userCanAccessPath,
} from '../services/permissionService'

function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, isLoading, user } = useAuth()
  const { settings } = useSystemSettings()

  if (isLoading) {
    return (
      <main className="route-loading">
        <div className="loading-line" />
        <p>Checking secure session...</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (location.pathname === '/') {
    return (
      <Navigate
        replace
        to={getDefaultLandingRouteForUser(user, {
          hiddenSidebarPaths: settings.hiddenSidebarPaths,
        })}
      />
    )
  }

  if (location.pathname !== '/access-denied' && !userCanAccessPath(user, location.pathname)) {
    return <Navigate replace to="/access-denied" />
  }

  return <Outlet />
}

function GuestRoute() {
  const location = useLocation()
  const { isAuthenticated, isLoading, user } = useAuth()
  const { settings } = useSystemSettings()

  if (isLoading) {
    return (
      <main className="route-loading">
        <div className="loading-line" />
        <p>Checking secure session...</p>
      </main>
    )
  }

  if (isAuthenticated) {
    const fromPath = location.state?.from?.pathname
    const landingRoute =
      fromPath && userCanAccessPath(user, fromPath)
        ? fromPath
        : getDefaultLandingRouteForUser(user, {
            hiddenSidebarPaths: settings.hiddenSidebarPaths,
          })

    return <Navigate replace to={landingRoute} />
  }

  return <Outlet />
}

export { GuestRoute, ProtectedRoute }
