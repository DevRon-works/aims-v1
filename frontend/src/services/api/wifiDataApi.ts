import { api } from '../../api/axios'

export const wifiDataApi = {
  list: () => api.get('/wifi-data'),
}
