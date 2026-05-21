import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, History, Save } from '../../lib/icons'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { ImportExcelDropzone } from '../../components/import/ImportExcelDropzone'
import { normalizeApiError } from '../../lib/apiErrors'
import {
  accountBranchOptions,
  bankOptions,
  companyOptions,
  createAccountRecord,
  getDefaultAccountFormValues,
  updateAccountRecord,
  type AccountRecord,
} from './accountsData'
import {
  accountSchema,
  accountStatusOptions,
  accountTypeOptions,
  type AccountFormValues,
} from './accountsSchema'

type AccountModalProps = {
  mode: 'add' | 'edit'
  open: boolean
  defaultAccountType?: AccountRecord['accountType']
  record?: AccountRecord | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

type ReadonlyModalProps = {
  open: boolean
  record: AccountRecord | null
  onOpenChange: (open: boolean) => void
}

const textFields = [
  ['merchantName', 'Merchant Name'],
  ['storeLocationName', 'Store Location Name'],
  ['storeAddress', 'Store Address'],
  ['storeManager', 'Store Manager'],
  ['storeEmail', 'Store Email'],
  ['storeContactNumber', 'Store Contact #'],
  ['accountName', 'Account Name'],
  ['accountNumber', 'Account # / Account Number'],
  ['pldtStatus', 'PLDT Status'],
  ['remarks', 'Remarks'],
  ['check', 'Check'],
  ['companyAccount', 'Company Account'],
  ['department', 'Department'],
  ['email', 'Email'],
  ['username', 'Username'],
  ['password', 'Password'],
  ['link', 'Link'],
] as const

function AccountFormModal({
  mode,
  open,
  defaultAccountType = 'Store Account',
  record,
  onOpenChange,
  onSaved,
}: AccountModalProps) {
  const defaultValues = {
    ...getDefaultAccountFormValues(),
    accountType: defaultAccountType,
  }
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: record ?? defaultValues,
  })

  useEffect(() => {
    form.reset(record ?? defaultValues)
  }, [form, record, open, defaultAccountType])

  async function handleSubmit(values: AccountFormValues) {
    try {
      accountSchema.parse(values)
      if (mode === 'edit' && record) {
        await updateAccountRecord(record.id, values)
      } else {
        await createAccountRecord(values)
      }
      onSaved()
      onOpenChange(false)
    } catch (error) {
      const normalizedError = normalizeApiError(error)

      toast.error(normalizedError.message ?? 'Unable to save account record.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="accounts-dialog">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add'
              ? defaultAccountType === 'Link Account'
                ? 'Add Link Account'
                : 'Add Account'
              : record?.accountType === 'Link Account'
                ? 'Edit Link Account'
                : 'Edit Account'}
          </DialogTitle>
          <DialogDescription>
            Maintain store, PLDT, and online portal credentials with validation and
            audit history.
          </DialogDescription>
        </DialogHeader>

        <form className="wifi-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="wifi-form-grid">
            <label className="field-group">
              <span className="label">Account Type</span>
              <Select {...form.register('accountType')}>
                {accountTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            <label className="field-group">
              <span className="label">Company</span>
              <Select {...form.register('company')}>
                {companyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            <label className="field-group">
              <span className="label">Branch</span>
              <Select {...form.register('branch')}>
                {accountBranchOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            <label className="field-group">
              <span className="label">Bank</span>
              <Select {...form.register('bank')}>
                <option value="">No bank selected</option>
                {bankOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            <label className="field-group">
              <span className="label">Status</span>
              <Select {...form.register('status')}>
                {accountStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            {textFields.map(([name, label]) => (
              <label className="field-group" key={name}>
                <span className="label">{label}</span>
                <Input
                  aria-invalid={Boolean(form.formState.errors[name])}
                  type={name === 'password' ? 'password' : 'text'}
                  {...form.register(name)}
                />
                <FieldError message={form.formState.errors[name]?.message} />
              </label>
            ))}

            <label className="field-group wifi-form-notes">
              <span className="label">Notes</span>
              <Textarea rows={3} {...form.register('notes')} />
            </label>
          </div>

          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Save aria-hidden="true" size={16} />
              Save Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ViewAccountDetailsModal({ open, record, onOpenChange }: ReadonlyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="accounts-dialog accounts-details-dialog">
        <DialogHeader>
          <DialogTitle>View Account Details</DialogTitle>
          <DialogDescription>
            Review merchant, banking, PLDT, link credential, missing-data, and audit details.
          </DialogDescription>
        </DialogHeader>
        {record ? (
          <div className="network-detail-grid">
            <div className="network-detail-main">
              {(record.accountType === 'Link Account'
                ? [
                    ['Department', record.department],
                    ['Email', record.email || 'Missing'],
                    ['Username', record.username || 'Missing'],
                    ['Password', record.password ? 'Available by role' : 'Missing'],
                    ['Link', record.link || 'Missing'],
                    ['Status', record.status],
                    ['Notes', record.notes],
                    ['Updated By', record.updatedBy],
                  ]
                : record.accountType === 'Store Account'
                ? [
                    ['Merchant Name', record.merchantName],
                    ['Store Location', record.storeLocationName],
                    ['Store Manager', record.storeManager],
                    ['Store Email', record.storeEmail || 'Missing'],
                    ['Store Contact #', record.storeContactNumber || 'Missing'],
                    ['Bank', record.bank || 'Missing'],
                    ['Account Name', record.accountName || 'Missing'],
                    ['Account #', record.accountNumber || 'Missing'],
                  ]
                : [
                    ['Company', record.company],
                    ['Branch', record.branch],
                    ['Status', record.pldtStatus],
                    ['Remarks', record.remarks],
                    ['Check', record.check],
                    ['Company Account', record.companyAccount],
                    ['Account Number', record.accountNumber || 'Missing'],
                    ['AIMS Status', record.status],
                  ]
              ).map(([label, value]) => (
                <div className="detail-field" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="network-detail-side">
              <div className="qr-preview">
                <Building2 aria-hidden="true" size={58} />
                <strong>{record.accountType}</strong>
                <span>
                  {record.duplicateAccountNumber
                    ? 'Duplicate account number needs review'
                    : 'Account record available by role'}
                </span>
              </div>
              <AccountAuditList record={record} />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function AccountHistoryModal({ open, record, onOpenChange }: ReadonlyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="wifi-test-dialog">
        <DialogHeader>
          <DialogTitle>Account History</DialogTitle>
          <DialogDescription>Notes and audit logs for this account record.</DialogDescription>
        </DialogHeader>
        {record ? <AccountAuditList record={record} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function AccountImportExcelModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="premium-import-dialog">
        <DialogHeader>
          <DialogTitle>Import Excel</DialogTitle>
          <DialogDescription>
            Import store, PLDT, and link account records with duplicate account,
            missing-link, invalid URL, and missing-data checks.
          </DialogDescription>
        </DialogHeader>
        <ImportExcelDropzone
          description="Expected columns match Store Accounts, PLDT Internet, and Link Accounts templates."
          title="Drop accounts workbook here"
        />
      </DialogContent>
    </Dialog>
  )
}

function AccountAuditList({ record }: { record: AccountRecord }) {
  return (
    <div className="audit-list">
      {record.logs.map((log) => (
        <div className="audit-item" key={`${log.timestamp}-${log.detail}`}>
          <strong>
            <History aria-hidden="true" size={14} />
            {log.detail}
          </strong>
          <span>
            {log.timestamp} - {log.actor}
          </span>
        </div>
      ))}
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="field-error">{message}</span> : null
}

export {
  AccountFormModal,
  AccountHistoryModal,
  AccountImportExcelModal,
  ViewAccountDetailsModal,
}
