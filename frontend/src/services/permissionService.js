import { navigationItems } from '../components/layout/navigation'

const ROLE_STORAGE_KEY = 'aims.access.roles'
const ROLE_EVENT = 'aims:roles-changed'

export const permissionActions = ['view', 'create', 'edit', 'update', 'delete', 'import', 'export', 'approve']

export function resourceKeyFromPath(path) {
  const key = path.replace(/^\/+/, '').replace(/\/+$/, '')
  return key || 'dashboard'
}

export const landingRoutePriority = [
  '/dashboard',
  '/internet-info',
  '/wifi-data',
  '/ip-addressing',
  '/remote',
  '/pos-hookup',
  '/accounts',
  '/emails',
  '/social-media',
  '/cameras',
  '/users',
  '/profile',
  '/system-settings',
]

export function permissionKey(resource, action) {
  return `${resource}.${action}`
}

export function getPermissionCatalog() {
  return navigationItems.map((item) => {
    const resource = resourceKeyFromPath(item.path)

    return {
      label: item.label,
      path: item.path,
      resource,
      permissions: permissionActions.map((action) => ({
        action,
        key: permissionKey(resource, action),
      })),
    }
  })
}

function allPermissionKeys() {
  return getPermissionCatalog().flatMap((resource) =>
    resource.permissions.map((permission) => permission.key),
  )
}

function viewPermissionKeys() {
  return getPermissionCatalog().map((resource) =>
    permissionKey(resource.resource, 'view'),
  )
}

function elevatedPermissionKeys() {
  return getPermissionCatalog()
    .filter((resource) => !['roles-permissions', 'system-settings'].includes(resource.resource))
    .flatMap((resource) =>
      resource.permissions
        .filter((permission) => permission.action !== 'approve')
        .map((permission) => permission.key),
    )
}

function defaultRoles() {
  return [
    {
      id: 'role-super-admin',
      name: 'Super Administrator',
      description: 'Full access to every module and action.',
      permissions: allPermissionKeys(),
      isSystem: true,
    },
    {
      id: 'role-admin',
      name: 'Administrator',
      description: 'Operational administration without approval authority.',
      permissions: elevatedPermissionKeys(),
      isSystem: false,
    },
    {
      id: 'role-manager',
      name: 'Manager',
      description: 'Manage day-to-day records and export operational data.',
      permissions: allPermissionKeys().filter(
        (key) =>
          key.endsWith('.view') ||
          key.endsWith('.create') ||
          key.endsWith('.edit') ||
          key.endsWith('.export'),
      ),
      isSystem: false,
    },
    {
      id: 'role-staff',
      name: 'Staff',
      description: 'Create and update assigned module records.',
      permissions: allPermissionKeys().filter(
        (key) => key.endsWith('.view') || key.endsWith('.create') || key.endsWith('.edit'),
      ),
      isSystem: false,
    },
    {
      id: 'role-viewer',
      name: 'Viewer',
      description: 'Read-only access to visible modules.',
      permissions: viewPermissionKeys(),
      isSystem: false,
    },
  ]
}

function normalizeRoles(roles) {
  const validPermissions = new Set(allPermissionKeys())
  const existingNames = new Set(roles.map((role) => role.name))
  const defaults = defaultRoles()
  const defaultByName = new Map(defaults.map((role) => [role.name, role]))
  const missingSystemRoles = defaults.filter((role) => !existingNames.has(role.name))

  return [...roles, ...missingSystemRoles].map((role) => ({
    ...role,
    permissions: (role.isSystem && defaultByName.has(role.name)
      ? defaultByName.get(role.name).permissions
      : role.permissions
    ).filter((permission) => validPermissions.has(permission)),
  }))
}

export function getRoles() {
  const storedRoles = window.localStorage.getItem(ROLE_STORAGE_KEY)

  if (!storedRoles) {
    const roles = defaultRoles()
    saveRoles(roles)
    return roles
  }

  try {
    return normalizeRoles(JSON.parse(storedRoles))
  } catch {
    const roles = defaultRoles()
    saveRoles(roles)
    return roles
  }
}

export function saveRoles(roles) {
  window.localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(roles))
  window.dispatchEvent(new CustomEvent(ROLE_EVENT))
}

export function getRoleByName(roleName) {
  return getRoles().find((role) => role.name === roleName) ?? null
}

export function getPermissionsForRole(roleName) {
  return getRoleByName(roleName)?.permissions ?? []
}

export function userCan(user, resource, action) {
  if (!user?.role) {
    return false
  }

  return getPermissionsForRole(user.role).includes(permissionKey(resource, action))
}

export function getFirstAccessibleRoute(
  routes = navigationItems,
  permissions = [],
  options = {},
) {
  const hiddenSidebarPaths = new Set(options.hiddenSidebarPaths ?? [])
  const routeByPath = new Map(routes.map((route) => [route.path, route]))

  return (
    landingRoutePriority
      .map((path) => routeByPath.get(path))
      .filter(Boolean)
      .find((route) => {
        if (route.disabled) {
          return false
        }

        if (hiddenSidebarPaths.has(route.path)) {
          return false
        }

        return permissions.includes(
          permissionKey(resourceKeyFromPath(route.path), 'view'),
        )
      })?.path ?? null
  )
}

export function getDefaultLandingRoute(userPermissions = [], options = {}) {
  return (
    getFirstAccessibleRoute(navigationItems, userPermissions, options) ??
    '/access-denied'
  )
}

export function getDefaultLandingRouteForUser(user, options = {}) {
  return getDefaultLandingRoute(
    user?.role ? getPermissionsForRole(user.role) : [],
    options,
  )
}

export function userCanAccessPath(user, path) {
  if (path === '/access-denied') {
    return true
  }

  return userCan(user, resourceKeyFromPath(path), 'view')
}

export function subscribeToRoleChanges(listener) {
  window.addEventListener(ROLE_EVENT, listener)
  window.addEventListener('storage', listener)

  return () => {
    window.removeEventListener(ROLE_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}
