import React, { useState, useRef, useEffect } from 'react'

const ignoreZoomByPrintAreaAllowed = (
  e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement> | WheelEvent
) => {
  return (
    !!(e.target as HTMLElement).closest('.NAME-print-area-allowed') ||
    !!(e.target as HTMLElement).closest('.NAME-root-element')
  )
}

// Hook để xử lý zoom và pan
export const useZoomEditBackground = (minZoom = 0.5, maxZoom = 3) => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // useEffect(() => {
  //   setTimeout(() => {
  //     setScale(2)
  //   }, 3000)
  // }, [])

  // State cho pinch zoom
  const [isPinching, setIsPinching] = useState(false)
  const [initialPinchDistance, setInitialPinchDistance] = useState(0)
  const [initialPinchScale, setInitialPinchScale] = useState(1)
  const [pinchCenter, setPinchCenter] = useState({ x: 0, y: 0 })

  // Tính khoảng cách giữa 2 điểm touch
  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Tính tâm giữa 2 điểm touch
  const getCenter = (touch1: Touch, touch2: Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    }
  }

  // Xử lý zoom bằng scroll wheel
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      if (ignoreZoomByPrintAreaAllowed(e)) return
      e.preventDefault()

      const rect = container.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.min(Math.max(scale * delta, minZoom), maxZoom)

      // Zoom về phía con trỏ chuột
      const scaleChange = newScale / scale
      const newX = mouseX - (mouseX - position.x) * scaleChange
      const newY = mouseY - (mouseY - position.y) * scaleChange

      setScale(newScale)
      setPosition({ x: newX, y: newY })
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [scale, position, minZoom, maxZoom])

  // Xử lý kéo (pan)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (ignoreZoomByPrintAreaAllowed(e)) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (ignoreZoomByPrintAreaAllowed(e)) return
    if (!isDragging) return

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Xử lý touch cho mobile với pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (ignoreZoomByPrintAreaAllowed(e)) return

    if (e.touches.length === 2) {
      // Bắt đầu pinch zoom
      e.preventDefault()
      setIsPinching(true)
      setIsDragging(false)

      const distance = getDistance(
        e.touches[0] as unknown as Touch,
        e.touches[1] as unknown as Touch
      )
      setInitialPinchDistance(distance)
      setInitialPinchScale(scale)

      // Lưu vị trí tâm của pinch so với container
      const container = containerRef.current
      if (container) {
        const rect = container.getBoundingClientRect()
        const center = getCenter(e.touches[0] as unknown as Touch, e.touches[1] as unknown as Touch)
        setPinchCenter({
          x: center.x - rect.left,
          y: center.y - rect.top,
        })
      }
    } else if (e.touches.length === 1) {
      // Pan bình thường
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (ignoreZoomByPrintAreaAllowed(e)) return

    if (isPinching && e.touches.length === 2) {
      // Xử lý pinch zoom
      e.preventDefault()

      const currentDistance = getDistance(
        e.touches[0] as unknown as Touch,
        e.touches[1] as unknown as Touch
      )
      const scaleChange = currentDistance / initialPinchDistance
      const newScale = Math.min(Math.max(initialPinchScale * scaleChange, minZoom), maxZoom)

      // Zoom về phía tâm pinch
      const finalScaleChange = newScale / scale
      const newX = pinchCenter.x - (pinchCenter.x - position.x) * finalScaleChange
      const newY = pinchCenter.y - (pinchCenter.y - position.y) * finalScaleChange

      setScale(newScale)
      setPosition({ x: newX, y: newY })
    } else if (isDragging && e.touches.length === 1) {
      // Pan bình thường
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      })
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      setIsPinching(false)
    }
    if (e.touches.length === 0) {
      setIsDragging(false)
    }
  }

  // Reset về mặc định
  const reset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // Zoom in/out bằng button
  const zoomIn = () => {
    setScale((prev) => Math.min(prev * 1.2, maxZoom))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev * 0.8, minZoom))
  }

  return {
    containerRef,
    scale,
    position,
    isDragging,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    controls: {
      zoomIn,
      zoomOut,
      reset,
    },
  }
}
