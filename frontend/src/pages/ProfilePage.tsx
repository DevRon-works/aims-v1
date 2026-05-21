import {
  Bell,
  CheckCircle2,
  Clock3,
  KeyRound,
  Laptop,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Palette,
  Pencil,
  Phone,
  ShieldCheck,
  Sun,
  UserRound,
} from '../lib/icons'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Checkbox } from '../components/ui/checkbox'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { ChangePasswordModal, EditProfileModal } from '../features/profile/ProfileModals'
import {
  getProfileForUser,
  profileActivityLogs,
  profileSessions,
  writeStoredProfile,
  type UserProfile,
} from '../features/profile/profileData'
import type { ProfileInfoFormValues, ProfileThemeMode } from '../features/profile/profileSchema'

const themeOptions: Array<{
  icon: typeof Sun
  label: string
  value: ProfileThemeMode
}> = [
  { icon: Sun, label: 'Light Mode', value: 'light' },
  { icon: Moon, label: 'Dark Mode', value: 'dark' },
  { icon: Palette, label: 'System Default', value: 'system' },
]

function ProfilePage() {
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
  const { setMode } = useTheme() as {
    setMode: (mode: ProfileThemeMode) => void
  }
  const [profile, setProfile] = useState<UserProfile>(() => getProfileForUser(user ?? {}))
  const [activeModal, setActiveModal] = useState<'edit' | 'password' | null>(null)
  const isAdmin = ['Administrator', 'Admin', 'Super Administrator', 'Super Admin'].includes(
    user?.role ?? profile.role,
  )
  const initials = useMemo(() => getInitials(profile.name), [profile.name])

  function saveProfile(nextProfile: UserProfile) {
    setProfile(nextProfile)
    writeStoredProfile(nextProfile)
  }

  function updateProfileInfo(values: ProfileInfoFormValues) {
    saveProfile({
      ...profile,
      ...values,
    })
    toast.success('Profile updated successfully.')
  }

  function updateTheme(themeMode: ProfileThemeMode) {
    saveProfile({ ...profile, themeMode })
    setMode(themeMode)
    toast.success('Appearance preference updated.')
  }

  function updateNotification(
    key: keyof UserProfile['notifications'],
    value: boolean,
  ) {
    saveProfile({
      ...profile,
      notifications: {
        ...profile.notifications,
        [key]: value,
      },
    })
    toast.info('Notification settings updated.')
  }

  function updateSecurity(key: keyof UserProfile['security'], value: string) {
    saveProfile({
      ...profile,
      security: {
        ...profile.security,
        [key]: value,
      },
    })
    toast.success('Security settings updated.')
  }

  return (
    <section className="profile-page">
      <div className="profile-hero">
        <div className="profile-identity">
          <Avatar className="profile-hero-avatar">
            <AvatarImage alt="" src={profile.avatarUrl} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="section-kicker">My Account</p>
            <h2>My Profile</h2>
            <p>
              Manage your personal account, password, appearance, notifications,
              security recovery details, sessions, and recent activity.
            </p>
            <div className="profile-hero-badges">
              <Badge variant="success">{profile.status}</Badge>
              <Badge variant="secondary">{profile.role}</Badge>
              <Badge variant="secondary">{profile.employeeId}</Badge>
            </div>
          </div>
        </div>
        <div className="profile-hero-actions">
          <Button type="button" variant="ghost" onClick={() => setActiveModal('password')}>
            <KeyRound aria-hidden="true" size={16} />
            Change Password
          </Button>
          <Button type="button" onClick={() => setActiveModal('edit')}>
            <Pencil aria-hidden="true" size={16} />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="profile-layout">
        <div className="profile-main-column">
          <Card className="profile-card">
            <CardHeader>
              <div className="settings-card-heading">
                <span className="settings-card-icon">
                  <UserRound aria-hidden="true" size={18} />
                </span>
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <p className="settings-card-description">
                    Personal account identity and administrator-managed assignment details.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="profile-info-grid">
                <InfoItem label="Full name" value={profile.name} />
                <InfoItem label="Username" value={profile.username} />
                <InfoItem label="Email" value={profile.email} />
                <InfoItem label="Contact number" value={profile.contactNumber} />
                <InfoItem label="Department" value={profile.department} locked />
                <InfoItem label="Position / Role" value={profile.position} locked />
                <InfoItem label="Assigned branch/location" value={profile.branch} locked />
                <InfoItem label="Employee ID" value={profile.employeeId} />
                <InfoItem label="Account status" value={profile.status} locked />
                <InfoItem label="Last login" value={profile.lastLogin} />
              </div>
              <p className="profile-permission-note">
                Users can only edit their own profile. Role, permissions, department,
                branch, and status remain controlled by Admin or Super Admin accounts.
              </p>
            </CardContent>
          </Card>

          <Card className="profile-card">
            <CardHeader>
              <div className="settings-card-heading">
                <span className="settings-card-icon">
                  <ShieldCheck aria-hidden="true" size={18} />
                </span>
                <div>
                  <CardTitle>Security Settings</CardTitle>
                  <p className="settings-card-description">
                    Recovery channels, two-factor readiness, and active device sessions.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="profile-security-grid">
                <div className="profile-security-status">
                  <span className="profile-security-icon">
                    <LockKeyhole aria-hidden="true" size={22} />
                  </span>
                  <div>
                    <strong>Two-factor authentication ready</strong>
                    <span>
                      {profile.security.twoFactorReady
                        ? 'Authenticator enrollment available'
                        : 'Ready for setup when policy is enabled'}
                    </span>
                  </div>
                  <Badge variant={profile.security.twoFactorReady ? 'success' : 'warning'}>
                    {profile.security.twoFactorReady ? 'Ready' : 'Pending'}
                  </Badge>
                </div>
                <div className="profile-recovery-grid">
                  <div className="field-group">
                    <Label>Recovery email</Label>
                    <Input
                      type="email"
                      value={profile.security.recoveryEmail}
                      onChange={(event) => updateSecurity('recoveryEmail', event.target.value)}
                    />
                  </div>
                  <div className="field-group">
                    <Label>Recovery phone number</Label>
                    <Input
                      value={profile.security.recoveryPhone}
                      onChange={(event) => updateSecurity('recoveryPhone', event.target.value)}
                    />
                  </div>
                </div>
                <div className="profile-session-list">
                  {profileSessions.map((session) => (
                    <div className="profile-session-item" key={session.id}>
                      <span className="profile-session-icon">
                        <Laptop aria-hidden="true" size={17} />
                      </span>
                      <div>
                        <strong>{session.device}</strong>
                        <span>
                          {session.ipAddress} - {session.location} - {session.lastActive}
                        </span>
                      </div>
                      {session.current ? <Badge variant="success">Current</Badge> : null}
                    </div>
                  ))}
                </div>
                <Button className="profile-logout-button" type="button" variant="ghost">
                  <LogOut aria-hidden="true" size={16} />
                  Logout Other Devices
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="profile-card">
            <CardHeader>
              <div className="settings-card-heading">
                <span className="settings-card-icon">
                  <Clock3 aria-hidden="true" size={18} />
                </span>
                <div>
                  <CardTitle>Activity Logs</CardTitle>
                  <p className="settings-card-description">
                    Login history, profile updates, password changes, exports, imports,
                    IP address, device, date, and time.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="profile-activity-list">
                {profileActivityLogs.map((log) => (
                  <div className="profile-activity-item" key={log.id}>
                    <span className="profile-activity-icon">
                      <CheckCircle2 aria-hidden="true" size={16} />
                    </span>
                    <div>
                      <strong>{log.action}</strong>
                      <span>
                        {log.ipAddress} - {log.device} - {log.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="profile-side-column">
          <Card className="profile-card">
            <CardHeader>
              <div className="settings-card-heading">
                <span className="settings-card-icon">
                  <Palette aria-hidden="true" size={18} />
                </span>
                <div>
                  <CardTitle>Appearance Settings</CardTitle>
                  <p className="settings-card-description">
                    Theme preference is saved to this user account.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="profile-theme-options">
                {themeOptions.map((option) => {
                  const Icon = option.icon

                  return (
                    <button
                      className={
                        profile.themeMode === option.value
                          ? 'profile-theme-option profile-theme-option-active'
                          : 'profile-theme-option'
                      }
                      key={option.value}
                      type="button"
                      onClick={() => updateTheme(option.value)}
                    >
                      <Icon aria-hidden="true" size={17} />
                      <span>{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="profile-card">
            <CardHeader>
              <div className="settings-card-heading">
                <span className="settings-card-icon">
                  <Bell aria-hidden="true" size={18} />
                </span>
                <div>
                  <CardTitle>Notification Settings</CardTitle>
                  <p className="settings-card-description">
                    Choose the account alerts you want enabled.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="settings-toggle-stack">
                <ProfileToggle
                  checked={profile.notifications.system}
                  icon={Bell}
                  label="System notifications"
                  onChange={(value) => updateNotification('system', value)}
                />
                <ProfileToggle
                  checked={profile.notifications.email}
                  icon={Mail}
                  label="Email notifications"
                  onChange={(value) => updateNotification('email', value)}
                />
                <ProfileToggle
                  checked={profile.notifications.loginAlerts}
                  icon={MapPin}
                  label="Login alerts"
                  onChange={(value) => updateNotification('loginAlerts', value)}
                />
                <ProfileToggle
                  checked={profile.notifications.passwordChangeAlerts}
                  icon={KeyRound}
                  label="Password change alerts"
                  onChange={(value) => updateNotification('passwordChangeAlerts', value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="profile-card">
            <CardHeader>
              <CardTitle>Account Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="profile-snapshot-list">
                <SnapshotItem icon={Mail} label="Email" value={profile.email} />
                <SnapshotItem icon={Phone} label="Phone" value={profile.contactNumber} />
                <SnapshotItem icon={MapPin} label="Location" value={profile.branch} />
                <SnapshotItem icon={ShieldCheck} label="Role" value={profile.role} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditProfileModal
        allowUsernameChange={isAdmin}
        open={activeModal === 'edit'}
        profile={profile}
        onOpenChange={(open) => setActiveModal(open ? 'edit' : null)}
        onSave={updateProfileInfo}
      />
      <ChangePasswordModal
        open={activeModal === 'password'}
        onOpenChange={(open) => setActiveModal(open ? 'password' : null)}
      />
    </section>
  )
}

function InfoItem({
  label,
  locked,
  value,
}: {
  label: string
  locked?: boolean
  value: string
}) {
  return (
    <div className="profile-info-item">
      <span>{label}</span>
      <strong>{value}</strong>
      {locked ? <small>Admin managed</small> : null}
    </div>
  )
}

function ProfileToggle({
  checked,
  icon: Icon,
  label,
  onChange,
}: {
  checked: boolean
  icon: typeof Bell
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <Label className="settings-toggle-row profile-toggle-row">
      <Checkbox checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>
        <strong>
          <Icon aria-hidden="true" size={14} />
          {label}
        </strong>
      </span>
    </Label>
  )
}

function SnapshotItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="profile-snapshot-item">
      <Icon aria-hidden="true" size={16} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export { ProfilePage }
