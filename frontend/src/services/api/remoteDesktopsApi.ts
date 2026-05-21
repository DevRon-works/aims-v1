import { api } from '../../api/axios'

export const remoteDesktopsApi = {
  list: () => api.get('/remote-desktops'),
}
