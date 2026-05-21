import { EyeOff, Mail } from '../../lib/icons'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { fetchEmailRecord, type EmailAccountRecord } from './emailsData'

type EmailViewModalProps = {
  open: boolean
  canViewSecret: boolean
  record: EmailAccountRecord | null
  onOpenChange: (open: boolean) => void
}

function EmailViewModal({ open, canViewSecret, record, onOpenChange }: EmailViewModalProps) {
  const [details, setDetails] = useState<EmailAccountRecord | null>(record)

  useEffect(() => {
    if (!open || !record?.id) {
      setDetails(record)
      return
    }

    fetchEmailRecord(record.id, { withSecret: canViewSecret })
      .then(setDetails)
      .catch(() => setDetails(record))
  }, [canViewSecret, open, record])

  const activeRecord = details ?? record

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="accounts-dialog accounts-details-dialog">
        <DialogHeader>
          <DialogTitle>Email Details</DialogTitle>
          <DialogDescription>Review the selected email record and recovery details.</DialogDescription>
        </DialogHeader>
        {activeRecord ? (
          <div className="network-detail-grid">
            <div className="network-detail-main">
              {[
                ['Emails Type', activeRecord.emailsType],
                ['Email Account', activeRecord.emailAccount],
                [
                  'Password',
                  canViewSecret
                    ? activeRecord.password || (activeRecord.hasPassword ? 'Saved' : 'Missing')
                    : activeRecord.hasPassword
                      ? 'Restricted'
                      : 'Missing',
                ],
                ['Department', activeRecord.department || 'Missing'],
                ['Person Used', activeRecord.personUsed || 'Missing'],
                ['Purpose', activeRecord.purpose || 'Missing'],
                ['Recovery Email', activeRecord.recoveryEmail || 'Missing'],
                ['Recovery Number & Verification', activeRecord.recoveryNumberVerification || 'Missing'],
              ].map(([label, value]) => (
                <div className="detail-field" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="network-detail-side">
              <div className="qr-preview">
                <Mail aria-hidden="true" size={58} />
                <strong>{activeRecord.emailAccount}</strong>
                <span>{activeRecord.emailsType || 'No email type'}</span>
              </div>
              {!canViewSecret && activeRecord.hasPassword ? (
                <div className="secret-value">
                  <EyeOff aria-hidden="true" size={13} />
                  Password hidden by permission
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export { EmailViewModal }
