import { useState } from 'react'
import { LoaderCircle, Plus } from '../../lib/icons'
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

const initialForm = {
  name: '',
  owner: '',
  status: 'Active',
  notes: '',
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

function AddRecordModal({ open, onOpenChange, title }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

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
      setForm(initialForm)
      onOpenChange(false)
    }, 700)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="record-dialog">
        <DialogHeader>
          <DialogTitle>Add {title}</DialogTitle>
          <DialogDescription>
            Create a new record with ownership, status, and internal notes.
          </DialogDescription>
        </DialogHeader>
        <form className="modal-form" noValidate onSubmit={handleSubmit}>
          <div className="modal-scroll">
            <div className="field-group">
              <label className="label" htmlFor="add-name">
                Name
              </label>
              <Input
                id="add-name"
                aria-invalid={Boolean(errors.name)}
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
              />
              {errors.name ? <p className="field-error">{errors.name}</p> : null}
            </div>

            <div className="field-group">
              <label className="label" htmlFor="add-owner">
                Owner
              </label>
              <Input
                id="add-owner"
                aria-invalid={Boolean(errors.owner)}
                value={form.owner}
                onChange={(event) => updateField('owner', event.target.value)}
              />
              {errors.owner ? <p className="field-error">{errors.owner}</p> : null}
            </div>

            <div className="field-group">
              <label className="label" htmlFor="add-status">
                Status
              </label>
              <Select
                id="add-status"
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Review">Review</option>
                <option value="Disabled">Disabled</option>
              </Select>
            </div>

            <div className="field-group">
              <label className="label" htmlFor="add-notes">
                Notes
              </label>
              <Textarea
                id="add-notes"
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
                  <Plus aria-hidden="true" size={16} />
                  Add record
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { AddRecordModal }
