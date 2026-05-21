import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { FileSpreadsheet, LoaderCircle, Upload, X } from '../../lib/icons'
import { Button } from '../ui/button'

type ImportExcelDropzoneProps = {
  file?: File | null
  isImporting?: boolean
  isLocked?: boolean
  lockedMessage?: string
  onClear?: () => void
  onImport?: () => void
  onSelectFile?: (file: File) => void
  title: string
  description: string
}

const acceptedFiles = '.xlsx,.xls,.csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

function ImportExcelDropzone({
  file: controlledFile,
  isImporting = false,
  isLocked = false,
  lockedMessage = 'Import already completed for this section.',
  onClear,
  onImport,
  onSelectFile,
  title,
  description,
}: ImportExcelDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [internalFile, setInternalFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const file = controlledFile !== undefined ? controlledFile : internalFile
  const isDisabled = isImporting

  function selectFile(nextFile: File | null | undefined) {
    if (!nextFile || isDisabled) {
      return
    }

    if (!/\.(xlsx|xls|csv)$/i.test(nextFile.name)) {
      toast.error('Upload an .xlsx, .xls, or .csv file.')
      return
    }

    setInternalFile(nextFile)
    onSelectFile?.(nextFile)
  }

  function clearFile() {
    if (isDisabled) {
      return
    }

    setInternalFile(null)
    onClear?.()
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  function importFile() {
    if (isLocked) {
      toast.info(lockedMessage)
      return
    }

    if (!file) {
      toast.error('Choose an Excel or CSV file to import.')
      return
    }

    if (!onImport) {
      toast.info('Import workflow is ready for file selection.')
      return
    }

    onImport()
  }

  return (
    <div className="premium-import-panel">
      <button
        className={isDragging ? 'premium-import-dropzone premium-import-dropzone-active' : 'premium-import-dropzone'}
        disabled={isDisabled}
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault()
          if (!isDisabled) {
            setIsDragging(true)
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          selectFile(event.dataTransfer.files?.[0])
        }}
      >
        {isImporting ? (
          <span className="premium-import-icon premium-import-icon-loading">
            <LoaderCircle aria-hidden="true" />
          </span>
        ) : (
          <span className="premium-import-icon">
            <Upload aria-hidden="true" />
          </span>
        )}
        <span className="premium-import-copy">
          <strong>{isImporting ? 'Importing workbook...' : title}</strong>
          <span>{isImporting ? 'Please keep this dialog open while records are processed.' : description}</span>
        </span>
        <span className="premium-import-badges" aria-hidden="true">
          <span>.xlsx</span>
          <span>.csv</span>
        </span>
      </button>

      <input
        ref={inputRef}
        accept={acceptedFiles}
        className="premium-import-input"
        disabled={isDisabled}
        type="file"
        onChange={(event) => selectFile(event.target.files?.[0])}
      />

      <div className="premium-import-footer">
        <div className={file ? 'premium-file-preview' : 'premium-file-preview premium-file-preview-empty'}>
          <FileSpreadsheet aria-hidden="true" size={18} />
          <span>{file ? file.name : 'No file selected'}</span>
          {file && !isDisabled ? (
            <button aria-label="Clear selected file" type="button" onClick={clearFile}>
              <X aria-hidden="true" size={14} />
            </button>
          ) : null}
        </div>

        <div className="premium-import-actions">
          <Button disabled={isDisabled || !file} type="button" variant="ghost" onClick={clearFile}>
            Clear
          </Button>
          <Button disabled={isDisabled || isLocked || !file} type="button" onClick={importFile}>
            {isImporting ? <LoaderCircle aria-hidden="true" className="spin" /> : <Upload aria-hidden="true" size={16} />}
            {isImporting ? 'Importing' : isLocked ? 'Import Completed' : 'Import Excel'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { ImportExcelDropzone }
