import { api, getCsrfCookie } from '../../api/axios'

export const accountsApi = {
  list: () => api.get('/accounts'),
  async create(payload: unknown) {
    await getCsrfCookie()
    return api.post('/accounts', payload)
  },
  async update(id: string, payload: unknown) {
    await getCsrfCookie()
    return api.put(`/accounts/${id}`, payload)
  },
  async remove(id: string) {
    await getCsrfCookie()
    return api.delete(`/accounts/${id}`)
  },
}
