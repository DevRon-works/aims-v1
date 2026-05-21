import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const SETTINGS_STORAGE_KEY = 'aims.system.settings'

const defaultSettings = {
  companyName: 'AIMS Corporation',
  companyEmail: 'it-admin@aims.local',
  companyPhone: '+1 (555) 014-2048',
  companyAddress: 'Enterprise Operations Center',
  logoDataUrl: '',
  systemName: 'AIMS',
  systemSubtitle: 'IT Portal',
  version: '1.0.0',
  releaseChannel: 'Stable',
  maintenanceWindow: 'Sunday 02:00 - 04:00',
  themePreset: 'blue',
  primaryColor: '#1d4ed8',
  sidebarVariant: 'expanded',
  sidebarDensity: 'comfortable',
  showSidebarGroups: true,
  hiddenSidebarPaths: [],
  emailFromName: 'AIMS Notifications',
  emailFromAddress: 'no-reply@aims.local',
  smtpHost: 'smtp.aims.local',
  smtpPort: '587',
  smtpEncryption: 'TLS',
  notifyEmail: true,
  notifyInApp: true,
  notifySecurity: true,
  notifyMaintenance: true,
  notifyDigest: 'Daily',
}

const baseModeTokens = {
  light: {
    destructive: '#dc2626',
    success: '#047857',
    warning: '#d97706',
    shadow: '0 20px 50px rgba(15, 23, 42, 0.12), 0 1px 2px rgba(15, 23, 42, 0.06)',
  },
  dark: {
    destructive: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
    shadow: '0 20px 50px rgba(0, 0, 0, 0.42), 0 1px 2px rgba(0, 0, 0, 0.36)',
  },
}

const neutralSurfaces = {
  light: {
    background: '#f8fafc',
    foreground: '#0f172a',
    card: '#ffffff',
    cardForeground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    border: '#dbe3ef',
    input: '#dbe3ef',
  },
  dark: {
    background: '#020617',
    foreground: '#e2e8f0',
    card: '#0f172a',
    cardForeground: '#f8fafc',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
    border: '#263449',
    input: '#334155',
  },
}

export const themePresets = [
  {
    id: 'blue',
    label: 'Blue',
    swatch: '#1d4ed8',
    light: { ...neutralSurfaces.light, primary: '#1d4ed8', primaryForeground: '#ffffff' },
    dark: { ...neutralSurfaces.dark, primary: '#60a5fa', primaryForeground: '#08111f' },
  },
  {
    id: 'white',
    label: 'White',
    swatch: '#ffffff',
    light: {
      background: '#ffffff',
      foreground: '#111827',
      card: '#ffffff',
      cardForeground: '#111827',
      muted: '#f8fafc',
      mutedForeground: '#64748b',
      border: '#e5e7eb',
      input: '#d1d5db',
      primary: '#f8fafc',
      primaryForeground: '#111827',
    },
    dark: {
      background: '#0a0a0a',
      foreground: '#f8fafc',
      card: '#111111',
      cardForeground: '#f8fafc',
      muted: '#1f2937',
      mutedForeground: '#cbd5e1',
      border: '#2f333a',
      input: '#374151',
      primary: '#f8fafc',
      primaryForeground: '#0a0a0a',
    },
  },
  {
    id: 'black',
    label: 'Black',
    swatch: '#030712',
    light: {
      ...neutralSurfaces.light,
      primary: '#111827',
      primaryForeground: '#ffffff',
    },
    dark: {
      background: '#000000',
      foreground: '#f9fafb',
      card: '#09090b',
      cardForeground: '#f9fafb',
      muted: '#18181b',
      mutedForeground: '#a1a1aa',
      border: '#27272a',
      input: '#3f3f46',
      primary: '#f9fafb',
      primaryForeground: '#000000',
    },
  },
  {
    id: 'yellow',
    label: 'Yellow',
    swatch: '#eab308',
    light: { ...neutralSurfaces.light, primary: '#ca8a04', primaryForeground: '#111827' },
    dark: { ...neutralSurfaces.dark, primary: '#facc15', primaryForeground: '#111827' },
  },
  {
    id: 'gray',
    label: 'Gray',
    swatch: '#64748b',
    light: {
      background: '#f8fafc',
      foreground: '#111827',
      card: '#ffffff',
      cardForeground: '#111827',
      muted: '#f3f4f6',
      mutedForeground: '#6b7280',
      border: '#d1d5db',
      input: '#d1d5db',
      primary: '#4b5563',
      primaryForeground: '#ffffff',
    },
    dark: { ...neutralSurfaces.dark, primary: '#cbd5e1', primaryForeground: '#111827' },
  },
  {
    id: 'dark-gray',
    label: 'Dark Gray',
    swatch: '#334155',
    light: {
      ...neutralSurfaces.light,
      primary: '#334155',
      primaryForeground: '#ffffff',
    },
    dark: {
      background: '#111827',
      foreground: '#e5e7eb',
      card: '#1f2937',
      cardForeground: '#f9fafb',
      muted: '#374151',
      mutedForeground: '#cbd5e1',
      border: '#4b5563',
      input: '#4b5563',
      primary: '#94a3b8',
      primaryForeground: '#111827',
    },
  },
  {
    id: 'green',
    label: 'Green',
    swatch: '#047857',
    light: { ...neutralSurfaces.light, primary: '#047857', primaryForeground: '#ffffff' },
    dark: { ...neutralSurfaces.dark, primary: '#34d399', primaryForeground: '#052e1f' },
  },
  {
    id: 'purple',
    label: 'Purple',
    swatch: '#7c3aed',
    light: { ...neutralSurfaces.light, primary: '#7c3aed', primaryForeground: '#ffffff' },
    dark: { ...neutralSurfaces.dark, primary: '#a78bfa', primaryForeground: '#1f1235' },
  },
  {
    id: 'red',
    label: 'Red',
    swatch: '#be123c',
    light: { ...neutralSurfaces.light, primary: '#be123c', primaryForeground: '#ffffff' },
    dark: { ...neutralSurfaces.dark, primary: '#fb7185', primaryForeground: '#3f0713' },
  },
]

const themePresetById = Object.fromEntries(themePresets.map((preset) => [preset.id, preset]))

const SystemSettingsContext = createContext(null)

function readStoredSettings() {
  const storedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY)

  if (!storedSettings) {
    return defaultSettings
  }

  try {
    const parsedSettings = { ...defaultSettings, ...JSON.parse(storedSettings) }
    const matchingPreset = themePresets.find(
      (preset) => preset.swatch.toLowerCase() === parsedSettings.primaryColor?.toLowerCase(),
    )

    return {
      ...parsedSettings,
      themePreset: parsedSettings.themePreset ?? matchingPreset?.id ?? defaultSettings.themePreset,
    }
  } catch {
    return defaultSettings
  }
}

function SystemSettingsProvider({ children }) {
  const [settings, setSettings] = useState(readStoredSettings)

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    document.title = `${settings.systemName} | ${settings.systemSubtitle}`
  }, [settings])

  const value = useMemo(
    () => ({
      resetSettings: () => setSettings(defaultSettings),
      settings,
      themePresets,
      updateSettings: (updates) =>
        setSettings((current) => {
          const nextPreset =
            updates.themePreset && themePresetById[updates.themePreset]
              ? themePresetById[updates.themePreset]
              : null

          return {
            ...current,
            ...updates,
            ...(nextPreset ? { primaryColor: nextPreset.swatch } : null),
          }
        }),
    }),
    [settings],
  )

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  )
}

function useSystemSettings() {
  const context = useContext(SystemSettingsContext)

  if (!context) {
    throw new Error('useSystemSettings must be used within SystemSettingsProvider')
  }

  return context
}

export { SystemSettingsProvider, baseModeTokens, defaultSettings, themePresetById, useSystemSettings }
