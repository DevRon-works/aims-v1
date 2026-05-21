import { api, getCsrfCookie } from '../../api/axios'

export const emailsApi = {
  list: (params: Record<string, string | undefined>) => api.get('/emails', { params }),
  options: () => api.get('/emails/options'),
  detail: (id: string, params: Record<string, number>) => api.get(`/emails/${id}`, { params }),
  export: (format: string) => api.get('/emails/export', {
    params: { format },
    responseType: 'blob',
  }),
  async create(payload: unknown) {
    await getCsrfCookie()
    return api.post('/emails', payload)
  },
  async update(id: string, payload: unknown) {
    await getCsrfCookie()
    return api.put(`/emails/${id}`, payload)
  },
  async remove(id: string) {
    await getCsrfCookie()
    return api.delete(`/emails/${id}`)
  },
  async import(file: File, onProgress?: (progress: number) => void) {
    await getCsrfCookie()
    const formData = new FormData()
    formData.append('file', file)

    return api.post('/emails/import', formData, {
      onUploadProgress: (event) => {
        if (event.total) {
          onProgress?.(Math.round((event.loaded / event.total) * 100))
        }
      },
    })
  },
}
