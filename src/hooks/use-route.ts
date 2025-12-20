import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useOnRouteChange(callback: (path: string) => void) {
  const location = useLocation()

  useEffect(() => {
    callback(location.pathname)
  }, [location.pathname])
}
