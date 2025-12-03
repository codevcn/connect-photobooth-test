import { useState, useRef, useEffect } from 'react'

type TPosition = { x: number; y: number }

interface UseDraggableOptions {
  currentPosition: TPosition
  setCurrentPosition: (pos: TPosition) => void
  disabled?: boolean // Thêm option để disable dragging
  postFunctionDrag?: (element: HTMLDivElement, position: TPosition) => void // Callback sau khi drag xong
  scaleFactor?: number // Hệ số tỉ lệ để điều chỉnh vị trí khi zoom
}

interface UseDraggableReturn {
  ref: React.RefObject<HTMLDivElement | null>
}

export const useDragElementWithoutButton = (options: UseDraggableOptions): UseDraggableReturn => {
  const {
    currentPosition,
    setCurrentPosition,
    disabled = false,
    postFunctionDrag,
    scaleFactor = 1,
  } = options

  const [dragging, setDragging] = useState<boolean>(false)
  const [offset, setOffset] = useState<TPosition>({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement | null>(null)

  const handleFinalPosition = (posX: TPosition['x'], posY: TPosition['y']) => {
    setCurrentPosition({
      x: posX / scaleFactor,
      y: posY / scaleFactor,
    })
  }

  // --- CHUỘT ---
  const handleMouseDown = (e: MouseEvent) => {
    if (disabled) return // Chặn nếu disabled
    e.stopPropagation()
    setDragging(true)
    setOffset({
      x: e.clientX - currentPosition.x * scaleFactor,
      y: e.clientY - currentPosition.y * scaleFactor,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging && !disabled) {
      handleFinalPosition(e.clientX - offset.x, e.clientY - offset.y)
    }
  }

  const handleMouseUp = () => {
    if (!disabled) {
      setDragging(false)
    }
    // Gọi callback sau khi drag xong
    if (postFunctionDrag && ref.current) {
      postFunctionDrag(ref.current, currentPosition)
    }
  }

  // --- CẢM ỨNG ---
  const handleTouchStart = (e: TouchEvent) => {
    if (disabled) return // Chặn nếu disabled

    const touch = e.touches[0]
    setDragging(true)
    setOffset({
      x: touch.clientX - currentPosition.x * scaleFactor,
      y: touch.clientY - currentPosition.y * scaleFactor,
    })
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (dragging && !disabled) {
      const touch = e.touches[0]
      handleFinalPosition(touch.clientX - offset.x, touch.clientY - offset.y)
    }
  }

  const handleTouchEnd = () => {
    if (!disabled) {
      setDragging(false)
    }
  }

  useEffect(() => {
    const el = ref.current
    if (el) {
      el.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)

      el.addEventListener('touchstart', handleTouchStart)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleTouchEnd)

      return () => {
        el.removeEventListener('mousedown', handleMouseDown)
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)

        el.removeEventListener('touchstart', handleTouchStart)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [dragging, offset, currentPosition, disabled, scaleFactor])

  return { ref }
}
