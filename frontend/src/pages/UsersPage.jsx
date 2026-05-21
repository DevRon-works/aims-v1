import { useEffect, useMemo, useState } from 'react'
import {
  Camera,
  CheckCircle2,
  Download,
  LoaderCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UserRoundCheck,
  UserRoundX,
} from '../lib/icons'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { TableEmptyState } from '../components/ui/table-states'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getRoles, subscribeToRoleChanges } from '../services/permissionService'
import { usersApi } from '../services/api/usersApi'
import { TableColumnEditorButton, useTableSchema } from '../features/dynamic-tables/useConfiguredTableColumns'

const emptyForm = {
  name: '',
  username: '',
  email: '',
  role: 'Staff',
  status: 'Active',
  avatarUrl: '',
}

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function validateUser(form, users, activeUser) {
  const errors = {}
  const duplicateUsername = users.some(
    (user) =>
      user.id !== activeUser?.id &&
      user.username.toLowerCase() === form.username.trim().toLowerCase(),
  )

  if (!form.name.trim()) {
    errors.name = 'Full name is required.'
  }

  if (!form.username.trim()) {
    errors.username = 'Username is required.'
  } else if (duplicateUsername) {
    errors.username = 'Username is already assigned.'
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.'
  }

  return errors
}

function statusVariant(status) {
  return status === 'Active' ? 'success' : 'secondary'
}

function UsersPage() {
  const { can } = useAuth()
  const canCreate = can('users', 'create')
  const canEdit = can('users', 'edit')
  const canDelete = can('users', 'delete')
  const canExport = can('users', 'export')
  const canApprove = can('users', 'approve')
  const tableColumns = useTableSchema('users')
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState(() => getRoles())
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalType, setModalType] = useState(null)
  const [activeUser, setActiveUser] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const roleNames = roles.map((role) => role.name)

  useEffect(() => {
    return subscribeToRoleChanges(() => {
      setRoles(getRoles())
    })
  }, [])

  useEffect(() => {
    usersApi
      .list()
      .then(setUsers)
      .catch(() => setUsers([]))
  }, [])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return users.filter((user) => {
      const matchesSearch = [user.name, user.username, user.email, user.role]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [query, roleFilter, statusFilter, users])

  function openUserModal(type, user = null) {
    setModalType(type)
    setActiveUser(user)
    setErrors({})
    setForm(user ?? emptyForm)
  }

  function closeModal() {
    setModalType(null)
    setActiveUser(null)
    setErrors({})
    setForm(emptyForm)
    setIsSaving(false)
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateUser(form, users, activeUser)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSaving(true)
    window.setTimeout(() => {
      if (activeUser) {
        setUsers((current) =>
          current.map((user) =>
            user.id === activeUser.id
              ? { ...user, ...form, lastActive: user.lastActive }
              : user,
          ),
        )
      } else {
        setUsers((current) => [
          {
            ...form,
            id: `usr-${Date.now()}`,
            lastActive: 'Just now',
          },
          ...current,
        ])
      }

      closeModal()
    }, 550)
  }

  function toggleStatus(user) {
    setUsers((current) =>
      current.map((item) =>
        item.id === user.id
          ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
          : item,
      ),
    )
  }

  function deleteUser() {
    if (!activeUser) {
      return
    }

    setIsSaving(true)
    window.setTimeout(() => {
      setUsers((current) => current.filter((user) => user.id !== activeUser.id))
      closeModal()
    }, 550)
  }

  return (
    <section className="crud-page users-page">
      <div className="crud-header">
        <div>
          <p className="section-kicker">Administration</p>
          <h2>Users</h2>
          <p className="crud-description">
            Manage accounts, role access, profile images, and account status.
          </p>
        </div>
        <Button
          className="crud-add-button"
          type="button"
          disabled={!canCreate}
          onClick={() => openUserModal('add')}
        >
          <Plus aria-hidden="true" size={17} />
          Add User
        </Button>
      </div>

      <Card className="crud-card">
        <CardHeader>
          <div>
            <CardTitle>Users Table</CardTitle>
            <p className="crud-card-description">
              Search, filter, assign roles, and activate or deactivate accounts.
            </p>
          </div>
          <div className="permission-card-actions">
            <Badge variant="secondary">{filteredUsers.length} shown</Badge>
            <Button type="button" variant="ghost" disabled={!canExport}>
              <Download aria-hidden="true" size={16} />
              Export
            </Button>
            <TableColumnEditorButton module="users" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="crud-toolbar">
            <div className="crud-search">
              <Search aria-hidden="true" className="crud-search-icon" size={17} />
              <Input
                placeholder="Search users"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="crud-filters">
              <Select
                aria-label="Filter by role"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="all">All roles</option>
                {roleNames.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
              <Select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>
          </div>

          <div className="crud-table-shell users-table-shell">
            {filteredUsers.length === 0 ? (
              <TableEmptyState title="No users found" message="Try another search or filter combination." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableColumns.map((column) => (
                      <TableHead key={column.key}>{column.label}</TableHead>
                    ))}
                    <TableHead className="table-action-column">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      {tableColumns.map((column) => (
                        <TableCell key={column.key}>
                          {column.key === 'name' ? (
                            <div className="user-cell">
                              <Avatar>
                                <AvatarImage alt="" src={user.avatarUrl} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="user-table-name">{user.name}</p>
                                <p className="user-table-email">{user.email}</p>
                              </div>
                            </div>
                          ) : column.key === 'role' ? (
                            <span className="role-pill">
                              <ShieldCheck aria-hidden="true" size={14} />
                              {user.role}
                            </span>
                          ) : column.key === 'status' ? (
                            <Badge variant={statusVariant(user.status)}>{user.status}</Badge>
                          ) : (
                            (column.is_custom ? user.custom_fields?.[column.key] : user[column.key]) ?? 'Not set'
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="table-action-column">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="row-action-trigger">
                            <MoreHorizontal aria-hidden="true" size={18} />
                            <span className="sr-only">Open user actions</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="row-action-menu">
                            <DropdownMenuItem
                              disabled={!canEdit}
                              onClick={() => openUserModal('edit', user)}
                            >
                              <Pencil aria-hidden="true" size={16} />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={!canApprove}
                              onClick={() => toggleStatus(user)}
                            >
                              {user.status === 'Active' ? (
                                <UserRoundX aria-hidden="true" size={16} />
                              ) : (
                                <UserRoundCheck aria-hidden="true" size={16} />
                              )}
                              {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={!canDelete}
                              onClick={() => openUserModal('delete', user)}
                            >
                              <Trash2 aria-hidden="true" size={16} />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalType === 'add' || modalType === 'edit'} onOpenChange={closeModal}>
        <DialogContent className="record-dialog user-dialog">
          <DialogHeader>
            <DialogTitle>{activeUser ? 'Edit user' : 'Add user'}</DialogTitle>
            <DialogDescription>
              Set profile details, account status, and role assignment.
            </DialogDescription>
          </DialogHeader>
          <form className="modal-form" noValidate onSubmit={handleSubmit}>
            <div className="modal-scroll">
              <div className="profile-image-preview">
                <Avatar className="profile-avatar">
                  <AvatarImage alt="" src={form.avatarUrl} />
                  <AvatarFallback>
                    {form.name ? getInitials(form.name) : <UserRound size={28} />}
                  </AvatarFallback>
                </Avatar>
                <div className="field-group">
                  <Label htmlFor="avatarUrl">Profile image URL</Label>
                  <div className="image-url-row">
                    <Camera aria-hidden="true" size={16} />
                    <Input
                      id="avatarUrl"
                      placeholder="https://example.com/avatar.jpg"
                      value={form.avatarUrl}
                      onChange={(event) => updateField('avatarUrl', event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="user-form-grid">
                <div className="field-group">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    aria-invalid={Boolean(errors.name)}
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                  />
                  {errors.name ? <p className="field-error">{errors.name}</p> : null}
                </div>
                <div className="field-group">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    aria-invalid={Boolean(errors.username)}
                    value={form.username}
                    onChange={(event) => updateField('username', event.target.value)}
                  />
                  {errors.username ? <p className="field-error">{errors.username}</p> : null}
                </div>
              </div>

              <div className="field-group">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  aria-invalid={Boolean(errors.email)}
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                />
                {errors.email ? <p className="field-error">{errors.email}</p> : null}
              </div>

              <div className="role-assignment-panel">
                <Label htmlFor="role">Role assignment</Label>
                <Select
                  id="role"
                  value={form.role}
                  onChange={(event) => updateField('role', event.target.value)}
                >
                  {roleNames.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
                <div className="role-chip-grid">
                  {roleNames.map((role) => (
                    <button
                      className={form.role === role ? 'role-chip role-chip-active' : 'role-chip'}
                      key={role}
                      type="button"
                      onClick={() => updateField('role', role)}
                    >
                      {form.role === role ? <CheckCircle2 aria-hidden="true" size={15} /> : null}
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <Label htmlFor="status">Account status</Label>
                <Select
                  id="status"
                  value={form.status}
                  onChange={(event) => updateField('status', event.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>
            </div>

            <div className="modal-actions">
              <Button type="button" variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <CheckCircle2 aria-hidden="true" size={16} />
                    Save user
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={modalType === 'delete'} onOpenChange={closeModal}>
        <DialogContent className="record-dialog delete-dialog">
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              Remove this account from the frontend user directory.
            </DialogDescription>
          </DialogHeader>
          <div className="modal-form">
            <div className="delete-warning">
              <strong>{activeUser?.name ?? 'Selected user'}</strong>
              <span>{activeUser?.email ?? 'This account'} will be removed.</span>
            </div>
            <div className="modal-actions">
              <Button type="button" variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button className="button-destructive" type="button" onClick={deleteUser}>
                {isSaving ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="spin" />
                    Deleting
                  </>
                ) : (
                  <>
                    <Trash2 aria-hidden="true" size={16} />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export { UsersPage }
