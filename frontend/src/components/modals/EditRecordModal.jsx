import { useEffect, useState } from 'react'
import { LoaderCircle, Save } from '../../lib/icons'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Textarea } from '../ui/textarea'

function buildForm(record) {
  return {
    name: record?.name ?? '',
    owner: record?.owner ?? '',
    status: record?.status ?? 'Active',
    notes: record?.notes ?? '',
  }
}

function validateForm(form) {
  const errors = {}

  if (!form.name.trim()) {
    errors.name = 'Name is required.'
  }

  if (!form.owner.trim()) {
    errors.owner = 'Owner is required.'
  }

  return errors
}

function EditRecordModal({ open, onOpenChange, record }) {
  const [form, setForm] = useState(buildForm(record))
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setForm(buildForm(record))
    setErrors({})
  }, [record])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateForm(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSaving(true)
    window.setTimeout(() => {
      setIsSaving(false)
      onOpenChange(false)
    }, 700)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="record-dialog">
        <DialogHeader>
          <DialogTitle>Edit record</DialogTitle>
          <DialogDescription>
            Update the selected record details and operational status.
          </DialogDescription>
        </DialogHeader>
        <form className="modal-form" noValidate onSubmit={handleSubmit}>
          <div className="modal-scroll">
            <div className="field-group">
              <label className="label" htmlFor="edit-name">
                Name
              </label>
              <Input
                id="edit-name"
                aria-invalid={Boolean(errors.name)}
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
              />
              {errors.name ? <p className="field-error">{errors.name}</p> : null}
            </div>

            <div className="field-group">
              <label className="label" htmlFor="edit-owner">
                Owner
              </label>
              <Input
                id="edit-owner"
                aria-invalid={Boolean(errors.owner)}
                value={form.owner}
                onChange={(event) => updateField('owner', event.target.value)}
              />
              {errors.owner ? <p className="field-error">{errors.owner}</p> : null}
            </div>

            <div className="field-group">
              <label className="label" htmlFor="edit-status">
                Status
              </label>
              <Select
                id="edit-status"
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Review">Review</option>
                <option value="Disabled">Disabled</option>
              </Select>
            </div>

            <div className="field-group">
              <label className="label" htmlFor="edit-notes">
                Notes
              </label>
              <Textarea
                id="edit-notes"
                rows={4}
                value={form.notes}
                onChange={(event) => updateField('notes', event.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
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
                  Save changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { EditRecordModal }
