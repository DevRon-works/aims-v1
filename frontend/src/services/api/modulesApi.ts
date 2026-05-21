import { api } from '../../api/axios'

export type ModuleRecord = {
  id: string
  name: string
  owner: string
  status: string
  updatedAt: string
}

export const modulesApi = {
  async list(resource: string): Promise<ModuleRecord[]> {
    const response = await api.get(`/modules/${resource}`)
    const rows = Array.isArray(response.data) ? response.data : response.data?.data ?? []

    return rows
  },
}
