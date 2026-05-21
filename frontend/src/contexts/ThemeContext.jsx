import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  baseModeTokens,
  themePresetById,
  useSystemSettings,
} from './SystemSettingsContext.jsx'

const THEME_MODE_STORAGE_KEY = 'aims.theme.mode'
const ThemeContext = createContext(null)

function readStoredMode() {
  const storedMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY)
  return ['light', 'dark', 'system'].includes(storedMode) ? storedMode : 'system'
}

function resolveTheme(mode) {
  if (mode !== 'system') {
    return mode
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function tintColor(hexColor, amount) {
  const hex = hexColor.replace('#', '')
  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : hex.padEnd(6, '0').slice(0, 6)
  const value = Number.parseInt(normalized, 16)
  const channels = [
    (value >> 16) & 255,
    (value >> 8) & 255,
    value & 255,
  ].map((channel) =>
    Math.max(0, Math.min(255, Math.round(channel + (255 - channel) * amount))),
  )

  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

function applyThemeToDocument({ mode, resolvedTheme, settings }) {
  const root = document.documentElement
  const preset = themePresetById[settings.themePreset] ?? themePresetById.blue
  const palette = {
    ...baseModeTokens[resolvedTheme],
    ...preset[resolvedTheme],
  }

  root.classList.toggle('dark', resolvedTheme === 'dark')
  root.dataset.theme = resolvedTheme
  root.dataset.themeMode = mode
  root.dataset.primaryTheme = preset.id
  root.style.colorScheme = resolvedTheme
  root.style.setProperty('--background', palette.background)
  root.style.setProperty('--foreground', palette.foreground)
  root.style.setProperty('--card', palette.card)
  root.style.setProperty('--card-foreground', palette.cardForeground)
  root.style.setProperty('--muted', palette.muted)
  root.style.setProperty('--muted-foreground', palette.mutedForeground)
  root.style.setProperty('--popover', palette.popover ?? palette.card)
  root.style.setProperty('--popover-foreground', palette.popoverForeground ?? palette.cardForeground)
  root.style.setProperty('--primary', palette.primary)
  root.style.setProperty('--primary-foreground', palette.primaryForeground)
  root.style.setProperty('--border', palette.border)
  root.style.setProperty('--input', palette.input)
  root.style.setProperty('--ring', tintColor(palette.primary, 0.2))
  root.style.setProperty('--destructive', palette.destructive)
  root.style.setProperty('--success', palette.success)
  root.style.setProperty('--warning', palette.warning)
  root.style.setProperty('--shadow', palette.shadow)
  root.style.setProperty('--brand-gradient-start', palette.primary)
  root.style.setProperty('--brand-gradient-end', tintColor(palette.primary, 0.28))
}

function ThemeProvider({ children }) {
  const { settings } = useSystemSettings()
  const [mode, setModeState] = useState(readStoredMode)
  const [systemThemeVersion, setSystemThemeVersion] = useState(0)
  const resolvedTheme = useMemo(
    () => resolveTheme(mode),
    [mode, systemThemeVersion],
  )

  useEffect(() => {
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode)
  }, [mode])

  useEffect(() => {
    if (mode !== 'system') {
      return undefined
    }

    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')

    if (!mediaQuery) {
      return undefined
    }

    const handleThemeChange = () => setSystemThemeVersion((current) => current + 1)
    mediaQuery.addEventListener('change', handleThemeChange)

    return () => mediaQuery.removeEventListener('change', handleThemeChange)
  }, [mode])

  useEffect(() => {
    applyThemeToDocument({ mode, resolvedTheme, settings })
  }, [mode, resolvedTheme, settings])

  const value = useMemo(
    () => ({
      mode,
      resolvedTheme,
      setMode: (nextMode) => {
        if (['light', 'dark', 'system'].includes(nextMode)) {
          setModeState(nextMode)
        }
      },
    }),
    [mode, resolvedTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}

export { ThemeProvider, useTheme }
