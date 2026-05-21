import { api } from '../../api/axios'

export const socialMediaApi = {
  list: () => api.get('/social-media-accounts'),
}
