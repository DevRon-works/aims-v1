import { ChevronDown, ChevronUp, LogOut, Settings, UserRound } from '../../lib/icons'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { useAuth } from '../../contexts/AuthContext.jsx'

type SidebarUserDropdownProps = {
  onNavigate?: () => void
}

function SidebarUserDropdown({ onNavigate }: SidebarUserDropdownProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { logout, user } = useAuth() as {
    logout: () => Promise<void>
    user: {
      avatar_url?: string
      department?: string
      email?: string
      name?: string
      role?: string
    } | null
  }
  const displayName = user?.name ?? 'Admin User'
  const displayRole = user?.role ?? 'IT Operations'
  const displayDepartment = user?.department ?? 'AIMS'
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  function goTo(path: string) {
    navigate(path)
    onNavigate?.()
  }

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
    onNavigate?.()
  }

  return (
    <div className="sidebar-user-section">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="sidebar-user-trigger">
          <Avatar>
            <AvatarImage alt="" src={user?.avatar_url ?? ''} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="sidebar-user-copy">
            <span className="sidebar-user-name">{displayName}</span>
            <span className="sidebar-user-role">
              {displayRole} / {displayDepartment}
            </span>
          </span>
          {open ? (
            <ChevronUp aria-hidden="true" className="sidebar-user-chevron" size={16} />
          ) : (
            <ChevronDown aria-hidden="true" className="sidebar-user-chevron" size={16} />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            align="start"
            className="sidebar-user-menu"
            side="top"
            sideOffset={8}
          >
            <DropdownMenuItem onClick={() => goTo('/profile')}>
              <UserRound aria-hidden="true" size={16} />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => goTo('/system-settings')}>
              <Settings aria-hidden="true" size={16} />
              System Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="sidebar-user-logout-item" onClick={handleLogout}>
              <LogOut aria-hidden="true" size={16} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  )
}

export { SidebarUserDropdown }
