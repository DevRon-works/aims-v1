import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { ImportExcelDropzone } from '../../components/import/ImportExcelDropzone'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { importEmailRecords, type EmailImportSummary } from './emailsData'
import { normalizeApiError } from '../../lib/apiErrors'
import type { ImportStatusRecord } from '../../services/importStatus'
import { Button } from '../../components/ui/button'

type EmailImportModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: () => void
  importStatus?: ImportStatusRecord
  isSuperAdmin?: boolean
  onResetImportLock?: () => void
}

function EmailImportModal({
  open,
  onOpenChange,
  onImported,
  importStatus,
  isSuperAdmin = false,
  onResetImportLock,
}: EmailImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [summary, setSummary] = useState<EmailImportSummary | null>(null)
  const isLocked = Boolean(importStatus?.locked)

  function resetImport() {
    setFile(null)
    setSummary(null)
  }

  async function submitImport() {
    if (!file) {
      toast.error('Choose an Excel or CSV file to import.')
      return
    }

    if (isLocked) {
      toast.info('Import already completed for this section.')
      return
    }

    setIsImporting(true)
    try {
      const result = await importEmailRecords(file)
      setSummary(result)
      toast.success(result?.message ?? 'Email records imported successfully')
      onImported()
    } catch (error) {
      const normalizedError = normalizeApiError(error)
      const responseSummary = normalizedError?.response?.data

      if (responseSummary && typeof responseSummary === 'object') {
        setSummary({
          total_rows: responseSummary.total_rows ?? 0,
          imported_rows: responseSummary.imported_rows ?? 0,
          skipped_rows: responseSummary.skipped_rows ?? 0,
          failed_rows: responseSummary.failed_rows ?? 0,
          validation_errors: responseSummary.validation_errors ?? [],
          message: responseSummary.message,
        })
      }

      toast.error(normalizedError.message ?? 'Import failed. Please review the file and try again.')
    } finally {
      setIsImporting(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isImporting) {
      resetImport()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="premium-import-dialog">
        <DialogHeader>
          <DialogTitle>Import Excel</DialogTitle>
          <DialogDescription>
            Upload files with EMAILS TYPE, EMAIL ACCOUNT, PASSWORD, DEPARTMENT, PERSON USED, PURPOSE,
            RECOVERY EMAIL, and RECOVERY NUMBER & VERIFICATION columns.
          </DialogDescription>
        </DialogHeader>

        {isLocked ? (
          <div className="cctv-import-lock-panel">
            <strong>Import already completed for this section.</strong>
            <span>
              {importStatus?.file_name || 'Previous import'} completed
              {importStatus?.imported_at ? ` on ${importStatus.imported_at}` : ''}.
            </span>
            <span>
              Imported rows: {importStatus?.imported_rows ?? 0} / Failed rows:{' '}
              {importStatus?.failed_rows ?? 0}
            </span>
            {isSuperAdmin ? (
              <Button type="button" variant="ghost" onClick={onResetImportLock}>
                Reset Import Lock
              </Button>
            ) : null}
          </div>
        ) : null}

        <ImportExcelDropzone
          description="Drop your workbook here or browse from your device. Values are normalized before import."
          file={file}
          isImporting={isImporting}
          isLocked={isLocked}
          lockedMessage="Import already completed for this section."
          title="Drop Excel or CSV file here"
          onClear={resetImport}
          onImport={submitImport}
          onSelectFile={(nextFile) => {
            setSummary(null)
            setFile(nextFile)
          }}
        />

        {summary ? <ImportSummary summary={summary} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function ImportSummary({ summary }: { summary: EmailImportSummary }) {
  return (
    <div className="email-import-summary">
      <div className="email-import-summary-grid">
        <SummaryItem label="Total rows" value={summary.total_rows} />
        <SummaryItem label="Imported" value={summary.imported_rows} />
        <SummaryItem label="Skipped" value={summary.skipped_rows} />
        <SummaryItem label="Failed" value={summary.failed_rows} />
      </div>

      {summary.validation_errors.length > 0 ? (
        <div className="email-import-errors">
          <strong>Failed rows</strong>
          <div className="wifi-table-shell email-import-error-table">
            <Table className="wifi-data-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Column</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.validation_errors.map((error) => (
                  <TableRow key={`${error.row}-${error.email ?? ''}-${error.column ?? ''}-${error.reason ?? ''}`}>
                    <TableCell>{error.row}</TableCell>
                    <TableCell>{error.email || 'Missing'}</TableCell>
                    <TableCell>{error.column || 'row'}</TableCell>
                    <TableCell>{error.reason || error.errors.join(', ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="email-import-summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export { EmailImportModal }
