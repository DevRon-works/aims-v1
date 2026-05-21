import { api, getCsrfCookie } from '../../api/axios'

export const cctvApi = {
  list: (endpoint: string, params: Record<string, number | string | undefined>) =>
    api.get(endpoint, { params }),
  detail: (endpoint: string, id: string) => api.get(`${endpoint}/${id}`),
  export: (
    endpoint: string,
    params: Record<string, number | string | undefined>,
  ) => api.get(`${endpoint}/export`, { params, responseType: 'blob' }),
  async create(endpoint: string, payload: unknown) {
    await getCsrfCookie()
    return api.post(endpoint, payload)
  },
  async update(endpoint: string, id: string, payload: unknown) {
    await getCsrfCookie()
    return api.put(`${endpoint}/${id}`, payload)
  },
  async remove(endpoint: string, id: string) {
    await getCsrfCookie()
    return api.delete(`${endpoint}/${id}`)
  },
  async import(section: string, file: File) {
    await getCsrfCookie()
    const formData = new FormData()
    formData.append('cctv_type', section)
    formData.append('file', file)

    return api.post('/cctv/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
