import axios from 'axios'
import { toast } from 'sonner'
import { normalizeApiError } from '../lib/apiErrors'

const apiRoot = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000'
const TOKEN_STORAGE_KEY = 'aims.auth.token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? `${apiRoot}/api`,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
})

api.interceptors.request.use((config) => {
  const token =
    window.localStorage.getItem(TOKEN_STORAGE_KEY) ??
    window.sessionStorage.getItem(TOKEN_STORAGE_KEY)

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = normalizeApiError(error)

    if (normalizedError?.status === 401 && window.location.pathname !== '/login') {
      window.location.assign('/login')
    }

    if (normalizedError?.config?.toast !== false) {
      toast.error(normalizedError?.message ?? 'Unable to connect to server.', {
        id: `api:${normalizedError?.status ?? 'network'}:${normalizedError?.message}`,
      })
    }

    return Promise.reject(normalizedError)
  },
)

async function getCsrfCookie() {
  await axios.get(`${apiRoot}/sanctum/csrf-cookie`, {
    withCredentials: true,
    withXSRFToken: true,
    headers: {
      Accept: 'application/json',
    },
  })
}

export { TOKEN_STORAGE_KEY, api, getCsrfCookie }
