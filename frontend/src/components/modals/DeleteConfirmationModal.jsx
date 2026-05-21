import { useState } from 'react'
import { LoaderCircle, Trash2 } from '../../lib/icons'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Input } from '../ui/input'

function DeleteConfirmationModal({ open, onOpenChange, record }) {
  const [confirmation, setConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const expectedValue = record?.name ?? ''

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (confirmation.trim() !== expectedValue) {
      setError('Type the record name exactly to confirm deletion.')
      return
    }

    setIsDeleting(true)
    window.setTimeout(() => {
      setIsDeleting(false)
      setConfirmation('')
      onOpenChange(false)
    }, 700)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="record-dialog delete-dialog">
        <DialogHeader>
          <DialogTitle>Delete record</DialogTitle>
          <DialogDescription>
            This action is permanent. Confirm the record name before deleting.
          </DialogDescription>
        </DialogHeader>
        <form className="modal-form" noValidate onSubmit={handleSubmit}>
          <div className="delete-warning">
            <strong>{expectedValue || 'Selected record'}</strong>
            <span>will be removed from this workspace.</span>
          </div>
          <div className="field-group">
            <label className="label" htmlFor="delete-confirmation">
              Type record name
            </label>
            <Input
              id="delete-confirmation"
              aria-invalid={Boolean(error)}
              value={confirmation}
              onChange={(event) => {
                setConfirmation(event.target.value)
                setError('')
              }}
            />
            {error ? <p className="field-error">{error}</p> : null}
          </div>
          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="button-destructive" type="submit" disabled={isDeleting}>
              {isDeleting ? (
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
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { DeleteConfirmationModal }
