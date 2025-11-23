import { useRef, useEffect } from 'react'

type PinchZoomOptions = {
  minScale?: number
  maxScale?: number
  scaleSensitivity?: number
  enableRotation?: boolean
  enablePan?: boolean
  currentScale: number
  setCurrentScale: React.Dispatch<React.SetStateAction<number>>
  currentRotation: number
  setCurrentRotation: React.Dispatch<React.SetStateAction<number>>
  currentPosition: Position
  setCurrentPosition: React.Dispatch<React.SetStateAction<Position>>
}

type Position = {
  x: number
  y: number
}

type TouchData = {
  initialDistance: number
  initialScale: number
  initialAngle: number
  initialRotation: number
  isDragging: boolean
  lastTouchPos: Position
}

type UsePinchZoomReturn = {
  ref: React.RefObject<HTMLDivElement | null>
  reset: () => void
}

// Hook để zoom, xoay và di chuyển element bằng touch gestures
export const usePinchElement = (options: PinchZoomOptions): UsePinchZoomReturn => {
  const {
    minScale,
    maxScale,
    scaleSensitivity = 0.01,
    enableRotation = true,
    enablePan = true,
    currentScale,
    setCurrentScale,
    currentRotation,
    setCurrentRotation,
    currentPosition,
    setCurrentPosition,
  } = options

  const elementRef = useRef<HTMLDivElement>(null)

  const touchData = useRef<TouchData>({
    initialDistance: 0,
    initialScale: 1,
    initialAngle: 0,
    initialRotation: 0,
    isDragging: false,
    lastTouchPos: { x: 0, y: 0 },
  })

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Tính khoảng cách giữa 2 ngón tay
    const getDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    // Tính góc giữa 2 ngón tay (tính bằng radian)
    const getAngle = (touch1: Touch, touch2: Touch): number => {
      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      return Math.atan2(dy, dx)
    }

    // Xử lý khi bắt đầu chạm
    const handleTouchStart = (e: TouchEvent): void => {
      if (e.touches.length === 2) {
        // 2 ngón tay = zoom + rotate
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]

        touchData.current.initialDistance = getDistance(touch1, touch2)
        touchData.current.initialScale = currentScale

        if (enableRotation) {
          touchData.current.initialAngle = getAngle(touch1, touch2)
          touchData.current.initialRotation = currentRotation
        }

        touchData.current.isDragging = false
      } else if (e.touches.length === 1 && enablePan) {
        // 1 ngón tay = pan (di chuyển)
        touchData.current.isDragging = true
        touchData.current.lastTouchPos = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      }
    }

    // Xử lý khi di chuyển ngón tay
    const handleTouchMove = (e: TouchEvent): void => {
      if (e.touches.length === 2) {
        // ZOOM + ROTATE với 2 ngón tay
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]

        // Xử lý ZOOM
        const currentDistance = getDistance(touch1, touch2)
        const distanceChange = currentDistance - touchData.current.initialDistance
        let newScale = touchData.current.initialScale + distanceChange * scaleSensitivity
        if (minScale && newScale < minScale) {
          newScale = minScale
        }
        if (maxScale && newScale > maxScale) {
          newScale = maxScale
        }
        setCurrentScale?.(newScale)

        // Xử lý ROTATE
        if (enableRotation) {
          const currentAngle = getAngle(touch1, touch2)
          const angleChange = currentAngle - touchData.current.initialAngle
          // Chuyển từ radian sang độ
          const angleDegrees = (angleChange * 180) / Math.PI
          const newRotation = touchData.current.initialRotation + angleDegrees
          setCurrentRotation?.(newRotation)
        }
      } else if (e.touches.length === 1 && touchData.current.isDragging && enablePan) {
        // PAN với 1 ngón tay
        e.preventDefault()
        const touch = e.touches[0]
        const deltaX = touch.clientX - touchData.current.lastTouchPos.x
        const deltaY = touch.clientY - touchData.current.lastTouchPos.y

        setCurrentPosition((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }))

        touchData.current.lastTouchPos = {
          x: touch.clientX,
          y: touch.clientY,
        }
      }
    }

    // Xử lý khi ngừng chạm
    const handleTouchEnd = (e: TouchEvent): void => {
      if (e.touches.length < 2) {
        touchData.current.initialDistance = 0
        touchData.current.initialAngle = 0
      }
      if (e.touches.length === 0) {
        touchData.current.isDragging = false
      }
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [
    currentScale,
    currentPosition,
    minScale,
    maxScale,
    scaleSensitivity,
    enableRotation,
    enablePan,
  ])

  const reset = (): void => {
    setCurrentScale(1)
    setCurrentRotation(0)
    setCurrentPosition({ x: 0, y: 0 })
  }

  return {
    ref: elementRef,
    reset,
  }
}
