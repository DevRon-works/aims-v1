import type { LucideIcon } from '../../lib/icons'
import { systemIcons } from '../../lib/icons'

export type NavigationItem = {
  label: string
  path: string
  icon: LucideIcon
  disabled?: boolean
  hidden?: boolean
}

export type NavigationGroup = {
  label: string
  items: NavigationItem[]
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: systemIcons.dashboard },
      { label: 'Internet Info', path: '/internet-info', icon: systemIcons.internetInfo },
      { label: 'Internet Graph', path: '/internet-graph', icon: systemIcons.internetGraph },
    ],
  },
  {
    label: 'Network',
    items: [
      { label: 'Wifi Data', path: '/wifi-data', icon: systemIcons.wifiData },
      { label: 'IP Addressing', path: '/ip-addressing', icon: systemIcons.ipAddressing },
      { label: 'Remote', path: '/remote', icon: systemIcons.remoteDesktop },
      { label: 'POS Hookup', path: '/pos-hookup', icon: systemIcons.posHookup },
    ],
  },
  {
    label: 'Business',
    items: [
      { label: 'Accounts', path: '/accounts', icon: systemIcons.accounts },
      { label: 'Emails', path: '/emails', icon: systemIcons.emails },
      { label: 'Social Media', path: '/social-media', icon: systemIcons.socialMedia },
      { label: 'Boutique', path: '/boutique', icon: systemIcons.boutique },
      { label: 'CCTV', path: '/cameras', icon: systemIcons.cctv },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Users', path: '/users', icon: systemIcons.users },
      { label: 'Roles & Permissions', path: '/roles-permissions', icon: systemIcons.rolesPermissions },
      { label: 'Profile', path: '/profile', icon: systemIcons.profile, hidden: true },
      { label: 'System Settings', path: '/system-settings', icon: systemIcons.settings, hidden: true },
    ],
  },
]

export const navigationItems = navigationGroups.flatMap((group) => group.items)
