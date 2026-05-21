import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'
import {
  getPermissionsForRole,
  permissionKey,
  subscribeToRoleChanges,
  userCan,
} from '../services/permissionService'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [roleVersion, setRoleVersion] = useState(0)

  useEffect(() => {
    let isMounted = true

    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser)
          setError(null)
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    return subscribeToRoleChanges(() => {
      setRoleVersion((current) => current + 1)
    })
  }, [])

  async function login(credentials) {
    setError(null)
    setIsLoading(true)

    try {
      const currentUser = await authService.login(credentials)
      setUser(currentUser)
      return currentUser
    } catch (requestError) {
      setError(requestError)
      throw requestError
    } finally {
      setIsLoading(false)
    }
  }

  async function logout() {
    setError(null)
    setIsLoading(true)

    try {
      await authService.logout()
    } finally {
      authService.clearRememberedLogin()
      setUser(null)
      setIsLoading(false)
    }
  }

  const value = useMemo(
    () => ({
      can: (resource, action) => userCan(user, resource, action),
      error,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      permissions: user?.role ? getPermissionsForRole(user.role) : [],
      permissionKey,
      setUser,
      user,
    }),
    [error, isLoading, roleVersion, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

export { AuthProvider, useAuth }
