import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import type { EmailAccountRecord } from './emailsData'

type EmailDeleteConfirmDialogProps = {
  record: EmailAccountRecord | null
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function EmailDeleteConfirmDialog({
  record,
  isDeleting,
  onCancel,
  onConfirm,
}: EmailDeleteConfirmDialogProps) {
  return (
    <Dialog open={Boolean(record)} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="wifi-test-dialog">
        <DialogHeader>
          <DialogTitle>Delete Email</DialogTitle>
          <DialogDescription>
            This will permanently delete the selected email record.
          </DialogDescription>
        </DialogHeader>
        {record ? (
          <div className="delete-confirmation-panel">
            <p>
              Delete <strong>{record.emailsType}</strong>{' '}
              <strong>{record.emailAccount}</strong>?
            </p>
            <div className="modal-actions">
              <Button disabled={isDeleting} type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
              <Button disabled={isDeleting} type="button" onClick={onConfirm}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export { EmailDeleteConfirmDialog }
