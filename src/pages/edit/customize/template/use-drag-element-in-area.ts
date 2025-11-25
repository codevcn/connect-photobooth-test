import { TPosition } from '@/utils/types/global'
import { useEffect, useRef } from 'react'

export const useDragElementInArea = (allowedMovingAreaQuery: string) => {
  const draggedElementRef = useRef<HTMLImageElement>(null)
  const allowedMovingAreaElementRef = useRef<HTMLElement>(null)
  const isDraggingRef = useRef<boolean>(false)
  const pointerStartPosRef = useRef<TPosition>({ x: 0, y: 0 }) // vị trí của chuột khi bắt đầu kéo
  const elementStartPosRef = useRef<TPosition>({ x: 0, y: 0 })

  const captureElementStartPlacement = (e: Event) => {
    if (!(e instanceof PointerEvent)) return
    const draggedElement = draggedElementRef.current
    if (!draggedElement) return
    allowedMovingAreaElementRef.current =
      draggedElement.closest<HTMLElement>(allowedMovingAreaQuery) || null
    if (!allowedMovingAreaElementRef.current) return
    isDraggingRef.current = true
    pointerStartPosRef.current = {
      x: e.clientX,
      y: e.clientY,
    }
    elementStartPosRef.current = {
      x: draggedElement.offsetLeft,
      y: draggedElement.offsetTop,
    }
  }

  const draggingElement = (e: Event) => {
    if (!isDraggingRef.current || !(e instanceof PointerEvent)) return
    const draggedElement = draggedElementRef.current
    if (!draggedElement) return
    const allowedMovingAreaRect = allowedMovingAreaElementRef.current?.getBoundingClientRect()
    if (!allowedMovingAreaRect) return
    const draggedElementRect = draggedElement.getBoundingClientRect()
    const pointerTranslationY = e.clientY - pointerStartPosRef.current.y
    const pointerTranslationX = e.clientX - pointerStartPosRef.current.x
    draggedElement.style.top = `${Math.max(
      0,
      Math.min(
        allowedMovingAreaRect.height - draggedElementRect.height,
        elementStartPosRef.current.y + pointerTranslationY
      )
    )}px`

    draggedElement.style.left = `${Math.max(
      0,
      Math.min(
        allowedMovingAreaRect.width - draggedElementRect.width,
        elementStartPosRef.current.x + pointerTranslationX
      )
    )}px`
  }

  const cancelDraggingElement = (e: Event) => {
    isDraggingRef.current = false
    allowedMovingAreaElementRef.current = null
    pointerStartPosRef.current = { x: 0, y: 0 }
    elementStartPosRef.current = { x: 0, y: 0 }
  }

  const init = () => {
    draggedElementRef.current?.addEventListener('pointerdown', captureElementStartPlacement)
    draggedElementRef.current?.addEventListener('pointerup', cancelDraggingElement)
    window.addEventListener('pointermove', draggingElement)
  }

  useEffect(() => {
    init()
    return () => {
      draggedElementRef.current?.removeEventListener('pointerdown', captureElementStartPlacement)
      draggedElementRef.current?.removeEventListener('pointerup', cancelDraggingElement)
      window.removeEventListener('pointermove', draggingElement)
    }
  }, [])

  return {
    draggedElementRef,
  }
}
