import { api } from '../../api/axios'

export const posHookupsApi = {
  list: () => api.get('/pos-hookups'),
}
