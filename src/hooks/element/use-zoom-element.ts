import { checkIfMobileScreen } from '@/utils/helpers'
import { useRef, useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'

type UseElementZoomOptions = {
  minZoom?: number // Scale tối thiểu (mặc định 0.3)
  maxZoom?: number // Scale tối đa (mặc định 2)
  sensitivityForDesktop?: number // Độ nhạy zoom (mặc định 0.01)
  sensitivityForMobile?: number // Độ nhạy zoom (mặc định 0.005)
  currentZoom: number
  setCurrentZoom: React.Dispatch<React.SetStateAction<number>>
  scaleFactor: number // Hệ số nhân cho việc zoom (mặc định 1)
  printAreaContainerRef: React.RefObject<HTMLElement | null>
}

type UseElementZoomReturn = {
  zoomButtonRef: React.RefObject<HTMLButtonElement | null>
  containerRef: React.RefObject<HTMLElement | null>
  isZooming: boolean
}

export const useZoomElement = (options: UseElementZoomOptions): UseElementZoomReturn => {
  const {
    minZoom = 0.2,
    maxZoom = 10,
    sensitivityForDesktop = 0.01,
    sensitivityForMobile = 0.01,
    currentZoom,
    setCurrentZoom,
    scaleFactor = 1,
    printAreaContainerRef,
  } = options
  const [isZooming, setIsZooming] = useState(false)
  const isZoomingRef = useRef(false)
  const containerRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0, distance: 0 })

  const getSensitivity = () => {
    return checkIfMobileScreen() ? sensitivityForMobile : sensitivityForDesktop
  }

  const getDistance = useCallback(
    (x: number, y: number, centerX: number, centerY: number): number => {
      return Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
    },
    []
  )

  const handleMouseDown = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()

      isZoomingRef.current = true
      setIsZooming(true)

      const divRect = containerRef.current?.getBoundingClientRect()
      if (!divRect) return
      const centerX = divRect.left + divRect.width / 2
      const centerY = divRect.top + divRect.height / 2

      dragStartRef.current = {
        x: e instanceof MouseEvent ? e.clientX : e.touches[0].clientX,
        y: e instanceof MouseEvent ? e.clientY : e.touches[0].clientY,
        distance: getDistance(
          e instanceof MouseEvent ? e.clientX : e.touches[0].clientX,
          e instanceof MouseEvent ? e.clientY : e.touches[0].clientY,
          centerX,
          centerY
        ),
      }

      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    },
    [getDistance]
  )

  const handleStart = useCallback(
    (e: PointerEvent) => {
      if (!isZoomingRef.current) return
      e.preventDefault()
      e.stopPropagation()

      const divRect = containerRef.current?.getBoundingClientRect()
      if (!divRect) return
      const centerX = divRect.left + divRect.width / 2
      const centerY = divRect.top + divRect.height / 2

      const currentDistance = getDistance(e.clientX, e.clientY, centerX, centerY)
      const distanceDiff = currentDistance - dragStartRef.current.distance

      // Chia distanceDiff cho scaleFactor để bù lại việc edit area đã được zoom
      const adjustedDistanceDiff = distanceDiff / scaleFactor

      // Tính toán scale: kéo xa center = zoom in, kéo gần center = zoom out
      const newScale = Math.max(
        minZoom,
        Math.min(maxZoom, currentZoom + adjustedDistanceDiff * getSensitivity())
      )

      setCurrentZoom(newScale)
      dragStartRef.current.distance = currentDistance
    },
    [getDistance, minZoom, maxZoom, currentZoom, setCurrentZoom, scaleFactor]
  )

  const handleUp = useCallback(() => {
    if (!isZoomingRef.current) return

    isZoomingRef.current = false
    setIsZooming(false)
    document.body.style.cursor = 'default'
    document.body.style.userSelect = 'auto'
  }, [])

  // Effect để add/remove listeners khi isZooming thay đổi
  useEffect(() => {
    document.body.addEventListener('pointermove', handleStart)
    document.body.addEventListener('pointerup', handleUp)
    document.body.addEventListener('pointercancel', handleUp)
    return () => {
      document.body.removeEventListener('pointermove', handleStart)
      document.body.removeEventListener('pointerup', handleUp)
      document.body.removeEventListener('pointercancel', handleUp)
    }
  }, [handleStart, handleUp, scaleFactor])

  // Effect để add listener cho button
  useEffect(() => {
    const button = buttonRef.current
    if (!button) return
    button.addEventListener('mousedown', handleMouseDown)
    button.addEventListener('touchstart', handleMouseDown)
    return () => {
      button.removeEventListener('mousedown', handleMouseDown)
      button.removeEventListener('touchstart', handleMouseDown)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
  }, [handleMouseDown])

  return {
    zoomButtonRef: buttonRef,
    containerRef: containerRef,
    isZooming: isZooming,
  }
}
