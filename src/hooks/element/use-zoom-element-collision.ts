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

export const useZoomElementCollision = (options: UseElementZoomOptions): UseElementZoomReturn => {
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

  // Kiểm tra xem element có gần va chạm với container không (28px threshold)
  const checkCollisionWithContainer = useCallback((newScale: number): boolean => {
    const element = containerRef.current
    const container = printAreaContainerRef.current
    if (!element || !container) return false

    const elementRect = element.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const threshold = 28 // pixels

    // Tạm thời scale element để tính toán vị trí mới
    const currentScale = currentZoom
    const scaleRatio = newScale / currentScale
    
    // Tính toán kích thước mới của element
    const newWidth = elementRect.width * scaleRatio
    const newHeight = elementRect.height * scaleRatio
    
    // Tính toán vị trí mới (giả sử scale từ center của element)
    const centerX = elementRect.left + elementRect.width / 2
    const centerY = elementRect.top + elementRect.height / 2
    const newLeft = centerX - newWidth / 2
    const newRight = centerX + newWidth / 2
    const newTop = centerY - newHeight / 2
    const newBottom = centerY + newHeight / 2

    // Kiểm tra khoảng cách đến các cạnh của container
    const distanceToLeft = newLeft - containerRect.left
    const distanceToRight = containerRect.right - newRight
    const distanceToTop = newTop - containerRect.top
    const distanceToBottom = containerRect.bottom - newBottom

    // Nếu bất kỳ khoảng cách nào < threshold, return true (gần va chạm)
    return (
      distanceToLeft < threshold ||
      distanceToRight < threshold ||
      distanceToTop < threshold ||
      distanceToBottom < threshold
    )
  }, [currentZoom, printAreaContainerRef])

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

      // Kiểm tra collision trước khi apply zoom mới
      // Chỉ kiểm tra khi zoom in (newScale > currentZoom)
      if (newScale > currentZoom && checkCollisionWithContainer(newScale)) {
        // Gần va chạm, không cho zoom thêm
        return
      }

      setCurrentZoom(newScale)
      dragStartRef.current.distance = currentDistance
    },
    [getDistance, minZoom, maxZoom, currentZoom, setCurrentZoom, scaleFactor, checkCollisionWithContainer]
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
