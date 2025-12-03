import { useState, useRef, useEffect, useCallback } from 'react'

type TPosition = { x: number; y: number }

interface UseDraggableOptions {
  currentPosition: TPosition
  setCurrentPosition: (pos: TPosition) => void
  disabled?: boolean
  postFunctionDrag?: (element: HTMLDivElement, position: TPosition) => void
  scaleFactor?: number
}

interface UseDraggableReturn {
  containerRef: React.RefObject<HTMLDivElement | null>
  dragButtonRef: React.RefObject<HTMLDivElement | null>
  isDragging: boolean
}

export const useDragElement = (options: UseDraggableOptions): UseDraggableReturn => {
  const {
    currentPosition,
    setCurrentPosition,
    disabled = false,
    postFunctionDrag,
    scaleFactor = 1,
  } = options

  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragButtonRef = useRef<HTMLDivElement | null>(null)
  const isDraggingRef = useRef(false)
  const offsetRef = useRef<TPosition>({ x: 0, y: 0 })

  // State
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const handleFinalPosition = useCallback(
    (posX: number, posY: number) => {
      setCurrentPosition({
        x: posX / scaleFactor,
        y: posY / scaleFactor,
      })
    },
    [scaleFactor, setCurrentPosition]
  )

  // Xử lý khi bắt đầu nhấn vào nút drag
  const handleStart = useCallback(
    (e: PointerEvent) => {
      if (disabled) return

      e.preventDefault()
      e.stopPropagation()

      isDraggingRef.current = true
      setIsDragging(true)

      const clientX = e.clientX
      const clientY = e.clientY

      offsetRef.current = {
        x: clientX - currentPosition.x * scaleFactor,
        y: clientY - currentPosition.y * scaleFactor,
      }

      document.body.style.cursor = 'move'
      document.body.style.userSelect = 'none'
    },
    [disabled, currentPosition, scaleFactor]
  )

  // Xử lý khi di chuyển
  const handleMove = useCallback(
    (e: PointerEvent) => {
      if (!isDraggingRef.current || disabled) return

      e.preventDefault()
      e.stopPropagation()

      const clientX = e.clientX
      const clientY = e.clientY

      handleFinalPosition(clientX - offsetRef.current.x, clientY - offsetRef.current.y)
    },
    [disabled, handleFinalPosition]
  )

  // Xử lý khi thả chuột/tay
  const handleEnd = useCallback(() => {
    if (!isDraggingRef.current) return

    isDraggingRef.current = false
    setIsDragging(false)

    document.body.style.cursor = 'default'
    document.body.style.userSelect = 'auto'

    // Gọi callback sau khi drag xong
    if (postFunctionDrag && containerRef.current) {
      postFunctionDrag(containerRef.current, currentPosition)
    }
  }, [postFunctionDrag, currentPosition])

  // Effect để đăng ký/hủy sự kiện
  useEffect(() => {
    const button = dragButtonRef.current
    if (!button) return

    // Đăng ký sự kiện chỉ trên nút drag
    button.addEventListener('pointerdown', handleStart)

    // Sự kiện move và end trên document để xử lý khi kéo ra ngoài
    document.body.addEventListener('pointermove', handleMove)

    document.body.addEventListener('pointerup', handleEnd)

    // Cleanup
    return () => {
      button.removeEventListener('pointerdown', handleStart)

      document.body.removeEventListener('pointermove', handleMove)

      document.body.removeEventListener('pointerup', handleEnd)

      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
  }, [handleStart, handleMove, handleEnd])

  return {
    containerRef,
    dragButtonRef,
    isDragging,
  }
}
