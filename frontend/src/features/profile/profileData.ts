import type { ProfileThemeMode } from './profileSchema'

export type UserProfile = {
  id: string
  name: string
  username: string
  email: string
  contactNumber: string
  department: string
  position: string
  role: string
  branch: string
  employeeId: string
  status: 'Active' | 'Inactive'
  lastLogin: string
  avatarUrl: string
  themeMode: ProfileThemeMode
  notifications: {
    system: boolean
    email: boolean
    loginAlerts: boolean
    passwordChangeAlerts: boolean
  }
  security: {
    twoFactorReady: boolean
    recoveryEmail: string
    recoveryPhone: string
  }
}

export type UserActivityLog = {
  id: string
  action: string
  ipAddress: string
  device: string
  timestamp: string
}

export type UserSession = {
  id: string
  device: string
  ipAddress: string
  location: string
  lastActive: string
  current?: boolean
}

export const PROFILE_STORAGE_KEY = 'aims.user.profiles'

const profileSeeds: Record<string, UserProfile> = {
  'usr-superadmin': {
    id: 'usr-superadmin',
    name: 'Super Admin',
    username: 'superadmin',
    email: 'superadmin@aims.local',
    contactNumber: '+65 8123 4401',
    department: 'Information Technology',
    position: 'Systems Owner',
    role: 'Super Administrator',
    branch: 'Avada Center',
    employeeId: 'AIMS-0001',
    status: 'Active',
    lastLogin: 'Today 09:42',
    avatarUrl: '',
    themeMode: 'system',
    notifications: {
      system: true,
      email: true,
      loginAlerts: true,
      passwordChangeAlerts: true,
    },
    security: {
      twoFactorReady: true,
      recoveryEmail: 'recovery-superadmin@aims.local',
      recoveryPhone: '+65 8123 4401',
    },
  },
  'usr-admin': {
    id: 'usr-admin',
    name: 'Admin User',
    username: 'admin',
    email: 'admin@aims.local',
    contactNumber: '+65 8123 4402',
    department: 'IT Operations',
    position: 'Administrator',
    role: 'Administrator',
    branch: 'Avada Center',
    employeeId: 'AIMS-0002',
    status: 'Active',
    lastLogin: 'Today 08:18',
    avatarUrl: '',
    themeMode: 'light',
    notifications: {
      system: true,
      email: false,
      loginAlerts: true,
      passwordChangeAlerts: true,
    },
    security: {
      twoFactorReady: false,
      recoveryEmail: 'admin.recovery@aims.local',
      recoveryPhone: '+65 8123 4402',
    },
  },
}

export const profileSessions: UserSession[] = [
  {
    id: 'ses-001',
    device: 'Chrome on Windows',
    ipAddress: '192.168.10.45',
    location: 'Avada Center',
    lastActive: 'Active now',
    current: true,
  },
  {
    id: 'ses-002',
    device: 'Edge on Windows',
    ipAddress: '192.168.10.52',
    location: 'IT Room',
    lastActive: 'Today 07:55',
  },
  {
    id: 'ses-003',
    device: 'Safari on iPhone',
    ipAddress: '172.16.4.22',
    location: 'Mobile network',
    lastActive: 'Yesterday 18:22',
  },
]

export const profileActivityLogs: UserActivityLog[] = [
  {
    id: 'act-001',
    action: 'Successful login',
    ipAddress: '192.168.10.45',
    device: 'Chrome on Windows',
    timestamp: 'Today 09:42',
  },
  {
    id: 'act-002',
    action: 'Updated profile contact number',
    ipAddress: '192.168.10.45',
    device: 'Chrome on Windows',
    timestamp: 'Today 09:18',
  },
  {
    id: 'act-003',
    action: 'Exported CCTV records',
    ipAddress: '192.168.10.45',
    device: 'Chrome on Windows',
    timestamp: 'Yesterday 16:07',
  },
  {
    id: 'act-004',
    action: 'Changed account password',
    ipAddress: '192.168.10.52',
    device: 'Edge on Windows',
    timestamp: 'May 14, 2026 11:31',
  },
  {
    id: 'act-005',
    action: 'Imported IP addressing workbook',
    ipAddress: '192.168.10.45',
    device: 'Chrome on Windows',
    timestamp: 'May 13, 2026 15:46',
  },
]

export function buildProfileFromUser(user: {
  id?: string
  name?: string
  username?: string
  email?: string
  role?: string
  avatar_url?: string
}): UserProfile {
  const id = user.id ?? 'current-user'
  const seed = profileSeeds[id]

  return {
    ...(seed ?? profileSeeds['usr-admin']),
    id,
    name: user.name ?? seed?.name ?? 'Admin User',
    username: user.username ?? seed?.username ?? 'admin',
    email: user.email ?? seed?.email ?? 'admin@aims.local',
    role: user.role ?? seed?.role ?? 'Administrator',
    position: user.role ?? seed?.position ?? 'Administrator',
    avatarUrl: user.avatar_url ?? seed?.avatarUrl ?? '',
  }
}

export function readStoredProfiles() {
  const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY)

  if (!stored) {
    return {}
  }

  try {
    return JSON.parse(stored) as Record<string, Partial<UserProfile>>
  } catch {
    return {}
  }
}

export function writeStoredProfile(profile: UserProfile) {
  const storedProfiles = readStoredProfiles()
  window.localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify({
      ...storedProfiles,
      [profile.id]: profile,
    }),
  )
}

export function getProfileForUser(user: Parameters<typeof buildProfileFromUser>[0]) {
  const baseProfile = buildProfileFromUser(user)
  const storedProfiles = readStoredProfiles()

  return {
    ...baseProfile,
    ...storedProfiles[baseProfile.id],
    id: baseProfile.id,
    role: baseProfile.role,
    department: storedProfiles[baseProfile.id]?.department ?? baseProfile.department,
    branch: storedProfiles[baseProfile.id]?.branch ?? baseProfile.branch,
    status: storedProfiles[baseProfile.id]?.status ?? baseProfile.status,
  }
}
