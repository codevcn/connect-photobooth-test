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
export const useZoomEditBackground = (
  minZoom: number = 0.5,
  maxZoom: number = 3,
  zoomInCoefficient: number = 1.2,
  zoomOutCoefficient: number = 0.8,
  edgesMargin: number = 20
) => {
  const [scale, setScale] = useState(createInitialConstants<number>('ELEMENT_ZOOM'))
  const [translate, setTranslate] = useState<TPosition>({ x: 0, y: 0 })
  const allowedPrintAreaRef = useRef<HTMLDivElement>(null)
  const printAreaContainerWrapperRef = useRef<HTMLElement | null>(null)

  // // Xử lý zoom bằng scroll wheel - zoom về trung tâm
  // useEffect(() => {
  //   const container = refForZoom.current
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
    setScale(createInitialConstants<number>('ELEMENT_ZOOM'))
    setTranslate({ x: 0, y: 0 })
  }

  // Zoom in/out bằng button - zoom về trung tâm
  const zoomIn = () => {
    const allowedPrintArea = allowedPrintAreaRef.current
    if (!allowedPrintArea) return
    const wrapperRect = printAreaContainerWrapperRef.current?.getBoundingClientRect()
    if (!wrapperRect) return
    const heightAfterZoom = allowedPrintArea.offsetHeight * scale * zoomInCoefficient
    const widthAfterZoom = allowedPrintArea.offsetWidth * scale * zoomInCoefficient
    if (heightAfterZoom > wrapperRect.height) {
      return
    }
    if (widthAfterZoom > wrapperRect.width) {
      return
    }
    setScale((prev) => Math.min(prev * zoomInCoefficient, maxZoom))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev * zoomOutCoefficient, minZoom))
  }

  const maxZoomAllowedPrintAreaIntoView = () => {
    const allowedPrintArea = allowedPrintAreaRef.current
    if (!allowedPrintArea) return
    const wrapper = printAreaContainerWrapperRef.current
    if (!wrapper) return
    console.log('>>> [cen] ele:', { allowedPrintArea, wrapper })
    const allowedPrintAreaRatio = allowedPrintArea.offsetWidth / allowedPrintArea.offsetHeight
    const wrapperRatio = wrapper.offsetWidth / wrapper.offsetHeight
    console.log('>>> [cen] ratios:', {
      allowedPrintAreaRatio,
      wrapperRatio,
      allowedWidth: allowedPrintArea.offsetWidth,
      allowedHeight: allowedPrintArea.offsetHeight,
      wrapperWidth: wrapper.offsetWidth,
      wrapperHeight: wrapper.offsetHeight,
    })
    if (allowedPrintAreaRatio > wrapperRatio) {
      const offsetWidth = allowedPrintArea.offsetWidth
      const newWidth = wrapper.offsetWidth - edgesMargin
      const newScaleByWidth = newWidth / offsetWidth
      console.log('>>> [cen] new zoom 1:', newScaleByWidth)
      setScale(newScaleByWidth)
    } else {
      const offsetHeight = allowedPrintArea.offsetHeight
      const newHeight = wrapper.offsetHeight - edgesMargin
      const newScaleByHeight = newHeight / offsetHeight
      console.log('>>> [cen] new zoom 2:', { newScaleByHeight, offsetHeight, newHeight })
      setScale(newScaleByHeight)
    }
  }

  const moveAllowedPrintAreaIntoView = () => {
    if (scale === 1) return
    const allowedPrintArea = allowedPrintAreaRef.current
    if (!allowedPrintArea) return
    const printAreaContainerWrapper = printAreaContainerWrapperRef.current
    if (!printAreaContainerWrapper) return
    console.log('>>> [mov] eles:', {
      allowedPrintArea,
      printAreaContainerWrapper,
    })
    const margin = 10
    let newX = 0
    let newY = 0
    const allowedPrintAreaRect = allowedPrintArea.getBoundingClientRect()
    const wrapperRect = printAreaContainerWrapper.getBoundingClientRect()
    console.log('>>> [mov] rects:', {
      allowedPrintAreaRect,
      wrapperRect,
    })
    if (allowedPrintAreaRect.left < wrapperRect.left) {
      console.log('>>> [mov] left')
      newX = Math.abs(wrapperRect.left - allowedPrintAreaRect.left) + margin
    }
    if (allowedPrintAreaRect.right > wrapperRect.right) {
      console.log('>>> [mov] right')
      newX = -(Math.abs(wrapperRect.right - allowedPrintAreaRect.right) + margin)
    }
    if (allowedPrintAreaRect.top < wrapperRect.top) {
      console.log('>>> [mov] top')
      newY = Math.abs(wrapperRect.top - allowedPrintAreaRect.top) + margin
    }
    if (allowedPrintAreaRect.bottom > wrapperRect.bottom) {
      console.log('>>> [mov] bottom')
      newY = -(Math.abs(wrapperRect.bottom - allowedPrintAreaRect.bottom) + margin)
    }
    console.log('>>> [mov] new position:', { x: newX, y: newY })
    setTranslate({ x: newX, y: newY })
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        moveAllowedPrintAreaIntoView()
      })
    })
  }, [scale])

  return {
    allowedPrintAreaRef,
    scale,
    translate,
    printAreaContainerWrapperRef,
    controls: {
      zoomIn,
      zoomOut,
      reset,
      setZoom: setScale,
    },
    maxZoomAllowedPrintAreaIntoView,
  }
}
