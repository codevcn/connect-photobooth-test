import { createInitialConstants } from '@/utils/contants'
import { TPosition } from '@/utils/types/global'
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
export const useZoomEditBackground = (minZoom: number = 0.5, maxZoom: number = 3) => {
  const [scale, setScale] = useState(createInitialConstants<number>('ELEMENT_ZOOM'))
  const [position, setPosition] = useState<TPosition>({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // // Xử lý zoom bằng scroll wheel - zoom về trung tâm
  // useEffect(() => {
  //   const container = containerRef.current
  //   if (!container) return

  //   const handleWheel = (e: WheelEvent) => {
  //     if (ignoreZoomByPrintAreaAllowed(e)) return
  //     e.preventDefault()

  //     const delta = e.deltaY > 0 ? 0.9 : 1.1
  //     const newScale = Math.min(Math.max(scale * delta, minZoom), maxZoom)

  //     setScale(newScale)
  //   }

  //   container.addEventListener('wheel', handleWheel, { passive: false })
  //   return () => container.removeEventListener('wheel', handleWheel)
  // }, [scale, minZoom, maxZoom])

  // Reset về mặc định
  const reset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // Zoom in/out bằng button - zoom về trung tâm
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
    isDragging: false,
    controls: {
      zoomIn,
      zoomOut,
      reset,
      setZoom: setScale,
    },
  }
}
