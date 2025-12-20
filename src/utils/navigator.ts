import type { NavigateFunction } from 'react-router-dom'

export const createQueryStringInURL = (): string => {
  const searchParams = new URLSearchParams(window.location.search)
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

export class AppNavigator {
  static navTo(
    navigate: NavigateFunction,
    path: string,
    params?: Record<string, string | undefined>
  ) {
    const existingQuery = createQueryStringInURL()

    // Parse existing query params
    const searchParams = new URLSearchParams(existingQuery || '')

    // Add new params
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined) {
          searchParams.delete(key)
          continue
        }
        searchParams.set(key, value) // tự động encode
      }
    }

    const queryString = searchParams.toString()
    const finalURL = queryString ? `${path}?${queryString}` : path

    navigate(finalURL)
  }
}
