import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, LoaderCircle, Plus, Save, ShieldCheck, Trash2 } from '../lib/icons'
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
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import {
  getPermissionCatalog,
  getRoles,
  permissionActions,
  permissionKey,
  saveRoles,
} from '../services/permissionService'

const emptyRoleForm = {
  name: '',
  description: '',
}

function RolesPermissionsPage() {
  const catalog = useMemo(() => getPermissionCatalog(), [])
  const [roles, setRoles] = useState(() => getRoles())
  const [selectedRoleId, setSelectedRoleId] = useState(() => getRoles()[0]?.id ?? '')
  const [modalType, setModalType] = useState(null)
  const [roleForm, setRoleForm] = useState(emptyRoleForm)
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0]
  const selectedPermissions = new Set(selectedRole?.permissions ?? [])

  useEffect(() => {
    if (!roles.some((role) => role.id === selectedRoleId)) {
      setSelectedRoleId(roles[0]?.id ?? '')
    }
  }, [roles, selectedRoleId])

  function persistRoles(nextRoles) {
    setRoles(nextRoles)
    saveRoles(nextRoles)
  }

  function updateRolePermissions(nextPermissions) {
    persistRoles(
      roles.map((role) =>
        role.id === selectedRole.id
          ? { ...role, permissions: [...new Set(nextPermissions)].sort() }
          : role,
      ),
    )
  }

  function togglePermission(resource, action) {
    if (selectedRole?.isSystem) {
      return
    }

    const key = permissionKey(resource, action)
    const nextPermissions = new Set(selectedPermissions)

    if (nextPermissions.has(key)) {
      nextPermissions.delete(key)
    } else {
      nextPermissions.add(key)
    }

    updateRolePermissions([...nextPermissions])
  }

  function toggleResource(resource) {
    if (selectedRole?.isSystem) {
      return
    }

    const resourcePermissions = permissionActions.map((action) =>
      permissionKey(resource, action),
    )
    const hasEveryPermission = resourcePermissions.every((key) =>
      selectedPermissions.has(key),
    )
    const nextPermissions = new Set(selectedPermissions)

    resourcePermissions.forEach((key) => {
      if (hasEveryPermission) {
        nextPermissions.delete(key)
      } else {
        nextPermissions.add(key)
      }
    })

    updateRolePermissions([...nextPermissions])
  }

  function openRoleModal(type, role = null) {
    setModalType(type)
    setErrors({})
    setRoleForm(
      role
        ? { name: role.name, description: role.description }
        : emptyRoleForm,
    )
  }

  function closeModal() {
    setModalType(null)
    setRoleForm(emptyRoleForm)
    setErrors({})
    setIsSaving(false)
  }

  function handleRoleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    const trimmedName = roleForm.name.trim()
    const duplicateName = roles.some(
      (role) =>
        role.id !== selectedRole?.id &&
        role.name.toLowerCase() === trimmedName.toLowerCase(),
    )

    if (!trimmedName) {
      nextErrors.name = 'Role name is required.'
    } else if (duplicateName) {
      nextErrors.name = 'Role name already exists.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSaving(true)
    window.setTimeout(() => {
      if (modalType === 'edit') {
        persistRoles(
          roles.map((role) =>
            role.id === selectedRole.id
              ? {
                  ...role,
                  name: trimmedName,
                  description: roleForm.description.trim(),
                }
              : role,
          ),
        )
      } else {
        const nextRole = {
          id: `role-${Date.now()}`,
          name: trimmedName,
          description: roleForm.description.trim(),
          permissions: [],
          isSystem: false,
        }
        persistRoles([...roles, nextRole])
        setSelectedRoleId(nextRole.id)
      }

      closeModal()
    }, 450)
  }

  function deleteSelectedRole() {
    if (!selectedRole || selectedRole.isSystem) {
      return
    }

    setIsSaving(true)
    window.setTimeout(() => {
      persistRoles(roles.filter((role) => role.id !== selectedRole.id))
      closeModal()
    }, 450)
  }

  return (
    <section className="crud-page roles-page">
      <div className="crud-header">
        <div>
          <p className="section-kicker">Administration</p>
          <h2>Roles & Permissions</h2>
          <p className="crud-description">
            Manage roles, permission actions, sidebar visibility, and page access rules.
          </p>
        </div>
        <Button type="button" className="crud-add-button" onClick={() => openRoleModal('add')}>
          <Plus aria-hidden="true" size={17} />
          Add Role
        </Button>
      </div>

      <div className="roles-layout">
        <Card className="roles-list-card">
          <CardHeader>
            <div>
              <CardTitle>Roles</CardTitle>
              <p className="crud-card-description">Select a role to manage permissions.</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="roles-list">
              {roles.map((role) => (
                <button
                  className={
                    role.id === selectedRole?.id
                      ? 'role-list-item role-list-item-active'
                      : 'role-list-item'
                  }
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  <span>
                    <strong>{role.name}</strong>
                    <small>{role.description || 'No description'}</small>
                  </span>
                  <Badge variant={role.isSystem ? 'default' : 'secondary'}>
                    {role.permissions.length}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="permission-matrix-card">
          <CardHeader>
            <div>
              <CardTitle>{selectedRole?.name ?? 'Select role'}</CardTitle>
              <p className="crud-card-description">
                Assign permissions by module and action. View controls sidebar and page access.
              </p>
            </div>
            <div className="permission-card-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => openRoleModal('edit', selectedRole)}
                disabled={!selectedRole || selectedRole.isSystem}
              >
                <Save aria-hidden="true" size={16} />
                Edit Role
              </Button>
              <Button
                className="button-destructive"
                type="button"
                onClick={() => openRoleModal('delete', selectedRole)}
                disabled={!selectedRole || selectedRole.isSystem}
              >
                <Trash2 aria-hidden="true" size={16} />
                Delete
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="permission-summary">
              <span>
                <ShieldCheck aria-hidden="true" size={16} />
                {selectedRole?.permissions.length ?? 0} assigned permissions
              </span>
              <Select
                aria-label="Switch role"
                value={selectedRole?.id ?? ''}
                onChange={(event) => setSelectedRoleId(event.target.value)}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="permission-matrix">
              <div className="permission-matrix-header">
                <span>Module</span>
                {permissionActions.map((action) => (
                  <span key={action}>{action}</span>
                ))}
              </div>
              {catalog.map((resource) => {
                const resourcePermissions = permissionActions.map((action) =>
                  permissionKey(resource.resource, action),
                )
                const hasEveryPermission = resourcePermissions.every((key) =>
                  selectedPermissions.has(key),
                )

                return (
                  <div className="permission-row" key={resource.resource}>
                    <button
                      className="permission-resource"
                      type="button"
                      disabled={selectedRole?.isSystem}
                      onClick={() => toggleResource(resource.resource)}
                    >
                      <span>{resource.label}</span>
                      {hasEveryPermission ? <CheckCircle2 aria-hidden="true" size={15} /> : null}
                    </button>
                    {permissionActions.map((action) => {
                      const key = permissionKey(resource.resource, action)
                      const isChecked = selectedPermissions.has(key)

                      return (
                        <button
                          aria-pressed={isChecked}
                          className={
                            isChecked
                              ? 'permission-toggle permission-toggle-active'
                              : 'permission-toggle'
                          }
                          key={key}
                          type="button"
                          disabled={selectedRole?.isSystem}
                          onClick={() => togglePermission(resource.resource, action)}
                        >
                          {isChecked ? <CheckCircle2 aria-hidden="true" size={16} /> : null}
                          <span className="sr-only">{key}</span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={modalType === 'add' || modalType === 'edit'} onOpenChange={closeModal}>
        <DialogContent className="record-dialog">
          <DialogHeader>
            <DialogTitle>{modalType === 'edit' ? 'Edit role' : 'Add role'}</DialogTitle>
            <DialogDescription>
              Roles are dynamic and can receive any permission from the catalog.
            </DialogDescription>
          </DialogHeader>
          <form className="modal-form" noValidate onSubmit={handleRoleSubmit}>
            <div className="field-group">
              <Label htmlFor="role-name">Role name</Label>
              <Input
                id="role-name"
                aria-invalid={Boolean(errors.name)}
                value={roleForm.name}
                onChange={(event) =>
                  setRoleForm((current) => ({ ...current, name: event.target.value }))
                }
              />
              {errors.name ? <p className="field-error">{errors.name}</p> : null}
            </div>
            <div className="field-group">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                rows={3}
                value={roleForm.description}
                onChange={(event) =>
                  setRoleForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
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
                    <Save aria-hidden="true" size={16} />
                    Save role
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
            <DialogTitle>Delete role</DialogTitle>
            <DialogDescription>
              This removes the role definition from the frontend permission store.
            </DialogDescription>
          </DialogHeader>
          <div className="modal-form">
            <div className="delete-warning">
              <strong>{selectedRole?.name ?? 'Selected role'}</strong>
              <span>Users assigned to this role will lose matching access.</span>
            </div>
            <div className="modal-actions">
              <Button type="button" variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button className="button-destructive" type="button" onClick={deleteSelectedRole}>
                {isSaving ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="spin" />
                    Deleting
                  </>
                ) : (
                  <>
                    <Trash2 aria-hidden="true" size={16} />
                    Delete role
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

export { RolesPermissionsPage }
