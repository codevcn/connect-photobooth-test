import { useEffect, useRef, useState } from 'react'

export const useDragElementInContainer = (containerQuery: string) => {
  const elementRef = useRef<HTMLElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const element = elementRef.current
    const container = elementRef.current?.closest<HTMLElement>(containerQuery)

    if (!element || !container) return

    const handleMouseDown = (e: PointerEvent) => {
      isDragging.current = true
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      }
      element.style.cursor = 'grabbing'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()

      let newX = e.clientX - dragStart.current.x
      let newY = e.clientY - dragStart.current.y

      // Giới hạn trong container
      const maxX = containerRect.width - elementRect.width
      const maxY = containerRect.height - elementRect.height

      newX = Math.max(0, Math.min(newX, maxX))
      newY = Math.max(0, Math.min(newY, maxY))

      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      isDragging.current = false
      element.style.cursor = 'grab'
    }

    element.addEventListener('pointerdown', handleMouseDown)
    document.addEventListener('pointermove', handleMouseMove)
    document.addEventListener('pointerup', handleMouseUp)

    return () => {
      element.removeEventListener('pointerdown', handleMouseDown)
      document.removeEventListener('pointermove', handleMouseMove)
      document.removeEventListener('pointerup', handleMouseUp)
    }
  }, [position])

  return { elementRef, position }
}
