import { api, getCsrfCookie } from '../../api/axios'

export const ipAddressesApi = {
  list: () => api.get('/ip-addresses'),
  async create(payload: unknown) {
    await getCsrfCookie()
    return api.post('/ip-addresses', payload)
  },
  async update(id: string, payload: unknown) {
    await getCsrfCookie()
    return api.put(`/ip-addresses/${id}`, payload)
  },
  async remove(id: string) {
    await getCsrfCookie()
    return api.delete(`/ip-addresses/${id}`)
  },
  async testConnection(id: string) {
    await getCsrfCookie()
    return api.post(`/ip-addresses/${id}/test-connection`)
  },
}
