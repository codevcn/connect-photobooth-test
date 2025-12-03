import { useState, useRef, useEffect } from 'react'

type TPosition = { x: number; y: number }

type UseDraggableOptions = {
  postFunctionDrag?: (element: HTMLDivElement, position: TPosition) => void // Callback sau khi drag xong
  scaleFactor?: number // Hệ số tỉ lệ để điều chỉnh vị trí khi zoom
}

type UseDraggableReturn = {
  refForDrag: React.RefObject<HTMLDivElement | null>
  position: TPosition
}

const stopDraggingByElement = (e: Event) => {
  return e.target instanceof HTMLElement && e.target.closest('.NAME-root-element')
}

export const useDragEditBackground = (options: UseDraggableOptions): UseDraggableReturn => {
  const { postFunctionDrag, scaleFactor = 1 } = options
  const [currentPosition, setCurrentPosition] = useState<TPosition>({ x: 0, y: 0 })

  const [dragging, setDragging] = useState<boolean>(false)
  const [offset, setOffset] = useState<TPosition>({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement | null>(null)

  const handleFinalPosition = (posX: TPosition['x'], posY: TPosition['y']) => {
    setCurrentPosition({
      x: posX / scaleFactor,
      y: posY / scaleFactor,
    })
  }

  const handlePointerDown = (e: MouseEvent) => {
    if (stopDraggingByElement(e)) return
    e.stopPropagation()
    setDragging(true)
    setOffset({
      x: e.clientX - currentPosition.x * scaleFactor,
      y: e.clientY - currentPosition.y * scaleFactor,
    })
  }

  const handlePointerMove = (e: MouseEvent) => {
    if (stopDraggingByElement(e)) return
    if (dragging) {
      handleFinalPosition(e.clientX - offset.x, e.clientY - offset.y)
    }
  }

  const handlePointerUp = () => {
    setDragging(false)
    // Gọi callback sau khi drag xong
    if (postFunctionDrag && ref.current) {
      postFunctionDrag(ref.current, currentPosition)
    }
  }

  useEffect(() => {
    const el = ref.current
    if (el) {
      el.addEventListener('pointerdown', handlePointerDown)
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)

      return () => {
        el.removeEventListener('pointerdown', handlePointerDown)
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }
    }
  }, [dragging, offset, currentPosition, scaleFactor])

  return {
    refForDrag: ref,
    position: currentPosition,
  }
}
