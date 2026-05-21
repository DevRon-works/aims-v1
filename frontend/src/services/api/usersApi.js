import { api } from '../../api/axios'

export const usersApi = {
  async list() {
    const response = await api.get('/users')

    return Array.isArray(response.data) ? response.data : response.data?.data ?? []
  },
}
