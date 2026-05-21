import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { navigationItems } from '../components/layout/navigation'
import { AccessDenied } from '../pages/AccessDenied.jsx'
import { AccountsPage } from '../pages/AccountsPage'
import { CctvPage } from '../pages/CctvPage'
import { Dashboard } from '../pages/Dashboard.jsx'
import { EmailsPage } from '../pages/EmailsPage'
import { IpAddressingPage } from '../pages/IpAddressingPage'
import { Login } from '../pages/Login.jsx'
import { ModulePage } from '../pages/ModulePage.jsx'
import { PosHookupPage } from '../pages/PosHookupPage'
import { ProfilePage } from '../pages/ProfilePage'
import { RemoteDesktopPage } from '../pages/RemoteDesktopPage'
import { RolesPermissionsPage } from '../pages/RolesPermissionsPage.jsx'
import { SocialMediaPage } from '../pages/SocialMediaPage'
import { SystemSettingsPage } from '../pages/SystemSettingsPage.jsx'
import { UsersPage } from '../pages/UsersPage.jsx'
import { WifiDataPage } from '../pages/WifiDataPage'
import { GuestRoute, ProtectedRoute } from './ProtectedRoute.jsx'
import { resourceKeyFromPath } from '../services/permissionService'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate replace to="/dashboard" />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wifi-data" element={<WifiDataPage />} />
          <Route path="/pos-hookup" element={<PosHookupPage />} />
          <Route path="/remote" element={<RemoteDesktopPage />} />
          <Route path="/ip-addressing" element={<IpAddressingPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/emails" element={<EmailsPage />} />
          <Route path="/social-media" element={<SocialMediaPage />} />
          <Route path="/cameras" element={<CctvPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/roles-permissions" element={<RolesPermissionsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/system-settings" element={<SystemSettingsPage />} />
          {navigationItems
            .filter(
              (item) =>
                ![
                  '/dashboard',
                  '/wifi-data',
                  '/pos-hookup',
                  '/remote',
                  '/ip-addressing',
                  '/accounts',
                  '/emails',
                  '/social-media',
                  '/cameras',
                  '/users',
                  '/roles-permissions',
                  '/profile',
                  '/system-settings',
                ].includes(item.path),
            )
            .map((item) => (
              <Route
                element={
                  <ModulePage
                    title={item.label}
                    resource={resourceKeyFromPath(item.path)}
                  />
                }
                key={item.path}
                path={item.path}
              />
            ))}
        </Route>
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}

export { AppRoutes }
