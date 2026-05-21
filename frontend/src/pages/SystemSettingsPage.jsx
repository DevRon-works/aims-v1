import {
  Bell,
  Building2,
  Check,
  ImageUp,
  Mail,
  MonitorCog,
  Palette,
  PanelLeft,
  RotateCcw,
  Save,
  SunMoon,
} from '../lib/icons'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Checkbox } from '../components/ui/checkbox'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { navigationGroups } from '../components/layout/navigation'
import { useSystemSettings } from '../contexts/SystemSettingsContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getProfileForUser, writeStoredProfile } from '../features/profile/profileData'

function SettingsCard({ children, description, icon: Icon, title }) {
  return (
    <Card className="settings-card">
      <CardHeader>
        <div className="settings-card-heading">
          <span className="settings-card-icon">
            <Icon aria-hidden="true" size={18} />
          </span>
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="settings-card-description">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function Field({ children, label }) {
  return (
    <div className="field-group">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function ToggleRow({ checked, description, label, onChange }) {
  return (
    <Label className="settings-toggle-row">
      <Checkbox checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
    </Label>
  )
}

function SystemSettingsPage() {
  const { resetSettings, settings, themePresets, updateSettings } = useSystemSettings()
  const { mode: themeMode, setMode: setThemeMode } = useTheme()
  const { user } = useAuth()

  function handleLogoUpload(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      updateSettings({ logoDataUrl: String(reader.result ?? '') })
      toast.success('System logo updated.')
    }
    reader.readAsDataURL(file)
  }

  function toggleSidebarPath(path, isVisible) {
    const hiddenSidebarPaths = isVisible
      ? settings.hiddenSidebarPaths.filter((hiddenPath) => hiddenPath !== path)
      : [...new Set([...settings.hiddenSidebarPaths, path])]

    updateSettings({ hiddenSidebarPaths })
  }

  function updateUserThemeMode(nextMode) {
    setThemeMode(nextMode)
    toast.success('Appearance preference updated.')

    if (user) {
      writeStoredProfile({
        ...getProfileForUser(user),
        themeMode: nextMode,
      })
    }
  }

  return (
    <section className="settings-page">
      <div className="settings-hero">
        <div>
          <p className="section-kicker">Enterprise Administration</p>
          <h2>Centralized System Settings</h2>
          <p>
            Manage identity, appearance, navigation, email delivery, and notification defaults
            from one control surface.
          </p>
        </div>
        <div className="settings-actions">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              resetSettings()
              toast.info('System settings reset to defaults.')
            }}
          >
            <RotateCcw aria-hidden="true" size={17} />
            Reset
          </Button>
          <Button type="button">
            <Save aria-hidden="true" size={17} />
            Saved
          </Button>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-main-column">
          <SettingsCard
            icon={Building2}
            title="Company Information"
            description="Branding and contact details used across the portal."
          >
            <div className="settings-form-grid">
              <Field label="Company name">
                <Input
                  value={settings.companyName}
                  onChange={(event) => updateSettings({ companyName: event.target.value })}
                />
              </Field>
              <Field label="Company email">
                <Input
                  type="email"
                  value={settings.companyEmail}
                  onChange={(event) => updateSettings({ companyEmail: event.target.value })}
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={settings.companyPhone}
                  onChange={(event) => updateSettings({ companyPhone: event.target.value })}
                />
              </Field>
              <Field label="Address">
                <Input
                  value={settings.companyAddress}
                  onChange={(event) => updateSettings({ companyAddress: event.target.value })}
                />
              </Field>
            </div>
          </SettingsCard>

          <SettingsCard
            icon={ImageUp}
            title="Logo Upload"
            description="Upload a logo that appears in the sidebar and sign-in experience."
          >
            <div className="logo-upload-panel">
              <div className="settings-logo-preview">
                {settings.logoDataUrl ? (
                  <img alt="" src={settings.logoDataUrl} />
                ) : (
                  <MonitorCog aria-hidden="true" size={28} />
                )}
              </div>
              <div className="logo-upload-copy">
                <Label className="logo-upload-button">
                  <ImageUp aria-hidden="true" size={17} />
                  Upload logo
                  <input accept="image/*" type="file" onChange={handleLogoUpload} />
                </Label>
                {settings.logoDataUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      updateSettings({ logoDataUrl: '' })
                      toast.info('System logo removed.')
                    }}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            icon={Palette}
            title="Theme Settings"
            description="Apply system-wide color, dark mode, and display preferences instantly."
          >
            <div className="settings-form-grid">
              <Field label="System name">
                <Input
                  value={settings.systemName}
                  onChange={(event) => updateSettings({ systemName: event.target.value })}
                />
              </Field>
              <Field label="System subtitle">
                <Input
                  value={settings.systemSubtitle}
                  onChange={(event) => updateSettings({ systemSubtitle: event.target.value })}
                />
              </Field>
              <Field label="Dark/light mode">
                <Select
                  value={themeMode}
                  onChange={(event) => updateUserThemeMode(event.target.value)}
                >
                  <option value="system">Follow device</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
              </Field>
              <Field label="Primary theme">
                <div className="theme-preset-grid">
                  {themePresets.map((preset) => (
                    <button
                      aria-label={`Use ${preset.label} theme`}
                      className={
                        settings.themePreset === preset.id
                          ? 'theme-preset-option theme-preset-option-active'
                          : 'theme-preset-option'
                      }
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        updateSettings({ themePreset: preset.id })
                        toast.success(`${preset.label} theme applied.`)
                      }}
                    >
                      <span
                        className="theme-preset-swatch"
                        style={{ backgroundColor: preset.swatch }}
                      >
                        {settings.themePreset === preset.id ? (
                          <Check aria-hidden="true" size={13} />
                        ) : null}
                      </span>
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </SettingsCard>

          <SettingsCard
            icon={PanelLeft}
            title="Sidebar Customization"
            description="Choose density, labels, and the modules visible in navigation."
          >
            <div className="settings-form-grid">
              <Field label="Sidebar layout">
                <Select
                  value={settings.sidebarVariant}
                  onChange={(event) => updateSettings({ sidebarVariant: event.target.value })}
                >
                  <option value="expanded">Full brand</option>
                  <option value="compact">Compact brand</option>
                </Select>
              </Field>
              <Field label="Sidebar density">
                <Select
                  value={settings.sidebarDensity}
                  onChange={(event) => updateSettings({ sidebarDensity: event.target.value })}
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </Select>
              </Field>
            </div>
            <ToggleRow
              checked={settings.showSidebarGroups}
              label="Show section headers"
              description="Display group names above related navigation modules."
              onChange={(showSidebarGroups) => updateSettings({ showSidebarGroups })}
            />
            <div className="sidebar-customization-list">
              {navigationGroups.map((group) => (
                <div className="sidebar-customization-group" key={group.label}>
                  <p>{group.label}</p>
                  {group.items.filter((item) => !item.hidden).map((item) => (
                    <ToggleRow
                      checked={!settings.hiddenSidebarPaths.includes(item.path)}
                      description={item.path}
                      key={item.path}
                      label={item.label}
                      onChange={(isVisible) => toggleSidebarPath(item.path, isVisible)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </SettingsCard>
        </div>

        <div className="settings-side-column">
          <SettingsCard
            icon={SunMoon}
            title="Version Settings"
            description="Control release metadata shown to administrators."
          >
            <div className="settings-form-grid single-column">
              <Field label="Version">
                <Input
                  value={settings.version}
                  onChange={(event) => updateSettings({ version: event.target.value })}
                />
              </Field>
              <Field label="Release channel">
                <Select
                  value={settings.releaseChannel}
                  onChange={(event) => updateSettings({ releaseChannel: event.target.value })}
                >
                  <option>Stable</option>
                  <option>Beta</option>
                  <option>Internal</option>
                </Select>
              </Field>
              <Field label="Maintenance window">
                <Input
                  value={settings.maintenanceWindow}
                  onChange={(event) => updateSettings({ maintenanceWindow: event.target.value })}
                />
              </Field>
            </div>
          </SettingsCard>

          <SettingsCard
            icon={Mail}
            title="Email Settings"
            description="Configure outbound sender and SMTP defaults."
          >
            <div className="settings-form-grid single-column">
              <Field label="From name">
                <Input
                  value={settings.emailFromName}
                  onChange={(event) => updateSettings({ emailFromName: event.target.value })}
                />
              </Field>
              <Field label="From address">
                <Input
                  type="email"
                  value={settings.emailFromAddress}
                  onChange={(event) => updateSettings({ emailFromAddress: event.target.value })}
                />
              </Field>
              <Field label="SMTP host">
                <Input
                  value={settings.smtpHost}
                  onChange={(event) => updateSettings({ smtpHost: event.target.value })}
                />
              </Field>
              <Field label="SMTP port">
                <Input
                  value={settings.smtpPort}
                  onChange={(event) => updateSettings({ smtpPort: event.target.value })}
                />
              </Field>
              <Field label="Encryption">
                <Select
                  value={settings.smtpEncryption}
                  onChange={(event) => updateSettings({ smtpEncryption: event.target.value })}
                >
                  <option>TLS</option>
                  <option>SSL</option>
                  <option>None</option>
                </Select>
              </Field>
            </div>
          </SettingsCard>

          <SettingsCard
            icon={Bell}
            title="Notification Settings"
            description="Set default notification channels and event categories."
          >
            <div className="settings-toggle-stack">
              <ToggleRow
                checked={settings.notifyEmail}
                label="Email alerts"
                description="Send configured notifications by email."
                onChange={(notifyEmail) => updateSettings({ notifyEmail })}
              />
              <ToggleRow
                checked={settings.notifyInApp}
                label="In-app alerts"
                description="Show alerts in the application header."
                onChange={(notifyInApp) => updateSettings({ notifyInApp })}
              />
              <ToggleRow
                checked={settings.notifySecurity}
                label="Security events"
                description="Notify admins about access and policy changes."
                onChange={(notifySecurity) => updateSettings({ notifySecurity })}
              />
              <ToggleRow
                checked={settings.notifyMaintenance}
                label="Maintenance events"
                description="Notify stakeholders before scheduled work."
                onChange={(notifyMaintenance) => updateSettings({ notifyMaintenance })}
              />
              <Field label="Digest frequency">
                <Select
                  value={settings.notifyDigest}
                  onChange={(event) => updateSettings({ notifyDigest: event.target.value })}
                >
                  <option>Realtime</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                </Select>
              </Field>
            </div>
          </SettingsCard>

          <Card className="settings-preview-card">
            <CardContent>
              <p className="section-kicker">Live Preview</p>
              <div className="settings-preview-brand">
                <div className="brand-mark">
                  {settings.logoDataUrl ? <img alt="" src={settings.logoDataUrl} /> : null}
                </div>
                <div>
                  <strong>{settings.systemName}</strong>
                  <span>{settings.companyName}</span>
                </div>
              </div>
              <Textarea
                readOnly
                value={`Version ${settings.version} (${settings.releaseChannel})\n${settings.emailFromName} <${settings.emailFromAddress}>\nDigest: ${settings.notifyDigest}`}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export { SystemSettingsPage }
