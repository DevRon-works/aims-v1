import { TOKEN_STORAGE_KEY, api, getCsrfCookie } from '../api/axios'

const SESSION_KEY = 'aims.auth.session'
const REMEMBERED_USERNAME_KEY = 'aims.auth.rememberedUsername'

function buildSession(user, token, remember) {
  return {
    token,
    user,
    remember: Boolean(remember),
    createdAt: new Date().toISOString(),
  }
}

function readSession() {
  const session =
    window.localStorage.getItem(SESSION_KEY) ??
    window.sessionStorage.getItem(SESSION_KEY)

  if (!session) {
    return null
  }

  try {
    return JSON.parse(session)
  } catch {
    clearSession()
    return null
  }
}

function writeSession(session) {
  const storage = session.remember ? window.localStorage : window.sessionStorage

  clearSession()
  storage.setItem(SESSION_KEY, JSON.stringify(session))
  storage.setItem(TOKEN_STORAGE_KEY, session.token)
  api.defaults.headers.common.Authorization = `Bearer ${session.token}`
  clearRememberedLogin()
}

function clearSession() {
  window.localStorage.removeItem(SESSION_KEY)
  window.sessionStorage.removeItem(SESSION_KEY)
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  window.sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  delete api.defaults.headers.common.Authorization
}

function clearRememberedLogin() {
  window.localStorage.removeItem(REMEMBERED_USERNAME_KEY)
  window.sessionStorage.removeItem(REMEMBERED_USERNAME_KEY)
}

async function login({ username, password, remember = false }) {
  await getCsrfCookie()
  const response = await api.post('/auth/login', {
    login: username.trim(),
    password,
    device_name: 'aims-frontend',
  }, { toast: false })
  const session = buildSession(response.data.user, response.data.token, remember)
  writeSession(session)
  return session.user
}

async function logout() {
  try {
    await api.post('/auth/logout', undefined, { toast: false })
  } catch {
    // A local logout still clears an expired or revoked token.
  }

  clearSession()
  clearRememberedLogin()
}

async function getCurrentUser() {
  const session = readSession()

  if (!session?.token) {
    return null
  }

  api.defaults.headers.common.Authorization = `Bearer ${session.token}`

  try {
    const response = await api.get('/user', { toast: false })
    const nextSession = { ...session, user: response.data }
    writeSession(nextSession)
    return nextSession.user
  } catch (error) {
    clearSession()
    throw error
  }
}

export const authService = {
  clearRememberedLogin,
  getCurrentUser,
  login,
  logout,
}
