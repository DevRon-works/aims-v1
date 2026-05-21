import { api, getCsrfCookie } from '../api/axios'

export type ImportStatusRecord = {
  module_name: string
  import_type: string
  status: 'processing' | 'success' | 'failed'
  locked: boolean
  file_name?: string | null
  total_rows?: number
  imported_rows?: number
  failed_rows?: number
  imported_by?: string | null
  imported_at?: string | null
}

export async function fetchImportStatus(moduleName?: string): Promise<ImportStatusRecord[]> {
  const response = await api.get(moduleName ? `/import-status/${moduleName}` : '/import-status')

  return response.data?.data ?? []
}

export async function resetImportLock(moduleName: string, importType = 'default'): Promise<void> {
  await getCsrfCookie()
  await api.post('/import-status/reset', {
    module_name: moduleName,
    import_type: importType,
  })
}

export function importStatusKey(moduleName: string, importType = 'default') {
  return `${moduleName}::${importType}`
}
