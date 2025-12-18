import type { NavigateFunction } from 'react-router-dom'

export class AppNavigator {
  static navTo(navigate: NavigateFunction, path: string) {
    const searchParams = new URLSearchParams(window.location.search)
    const queryString = searchParams.toString()
    navigate(`${path}${queryString ? `?${queryString}` : ''}`)
  }
}
