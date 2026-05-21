import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/axios'

function useApiQuery(request, options = {}) {
  const { enabled = true, initialData = null } = options
  const [data, setData] = useState(initialData)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(enabled))

  const execute = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await request(api)
      const nextData = response?.data ?? response
      setData(nextData)
      return nextData
    } catch (requestError) {
      setError(requestError)
      throw requestError
    } finally {
      setIsLoading(false)
    }
  }, [request])

  useEffect(() => {
    if (enabled) {
      execute().catch(() => undefined)
    }
  }, [enabled, execute])

  return { data, error, isLoading, refetch: execute }
}

function useApiMutation(request) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const mutate = useCallback(
    async (payload) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await request(payload, api)
        const nextData = response?.data ?? response
        setData(nextData)
        return nextData
      } catch (requestError) {
        setError(requestError)
        throw requestError
      } finally {
        setIsLoading(false)
      }
    },
    [request],
  )

  return { data, error, isLoading, mutate }
}

export { useApiMutation, useApiQuery }
