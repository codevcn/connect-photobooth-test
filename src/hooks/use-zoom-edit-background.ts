import { useEditedElementStore } from '@/stores/element/element.store'
import { createInitialConstants } from '@/utils/contants'
import { TPosition } from '@/utils/types/global'
import { useState, useRef, useEffect } from 'react'

// Hook để xử lý zoom và pan
export const useZoomEditBackground = (
  minZoom: number = 0.5,
  maxZoom: number = 3,
  zoomInCoefficient: number = 1.2,
  zoomOutCoefficient: number = 0.8,
  edgesMargin: number = 10
) => {
  const [scale, setScale] = useState(createInitialConstants<number>('ELEMENT_ZOOM'))
  const [translate, setTranslate] = useState<TPosition>({ x: 0, y: 0 })
  const allowedPrintAreaRef = useRef<HTMLDivElement>(null)
  const printAreaContainerWrapperRef = useRef<HTMLElement | null>(null)
  const printedImagesBuildId = useEditedElementStore((s) => s.printedImagesBuildId)
  const printedImages = useEditedElementStore((s) => s.printedImages)
  const preBuildIdRef = useRef<string | null>(null)

  // Reset về mặc định
  const reset = () => {
    setScale(createInitialConstants<number>('ELEMENT_ZOOM'))
    setTranslate({ x: 0, y: 0 })
  }

  const calculateMaxScaleForAllowedPrintArea = (
    allowedPrintArea: HTMLElement,
    printAreaContainerWrapper: HTMLElement
  ) => {
    const allowedPrintAreaOffsetWidth = allowedPrintArea.offsetWidth
    const allowedPrintAreaOffsetHeight = allowedPrintArea.offsetHeight
    const wrapperRect = printAreaContainerWrapper.getBoundingClientRect()
    const wrapperWidth = wrapperRect.width
    const wrapperHeight = wrapperRect.height
    if (allowedPrintAreaOffsetWidth / allowedPrintAreaOffsetHeight > wrapperWidth / wrapperHeight) {
      const allowedPrintAreaNewOffsetWidth = wrapperWidth - edgesMargin * 2
      const newScaleByWidth = allowedPrintAreaNewOffsetWidth / allowedPrintAreaOffsetWidth
      return newScaleByWidth
    }
    const allowedPrintAreaNewOffsetHeight = wrapperHeight - edgesMargin * 2
    const newScaleByHeight = allowedPrintAreaNewOffsetHeight / allowedPrintAreaOffsetHeight
    return newScaleByHeight
  }

  // Zoom in/out bằng button - zoom về trung tâm
  const zoomIn = () => {
    const allowedPrintArea = allowedPrintAreaRef.current
    if (!allowedPrintArea) return
    const wrapper = printAreaContainerWrapperRef.current
    if (!wrapper) return
    setScale((prev) =>
      Math.min(
        prev * zoomInCoefficient,
        calculateMaxScaleForAllowedPrintArea(allowedPrintArea, wrapper)
      )
    )
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev * zoomOutCoefficient, minZoom))
  }

  const maxZoomAllowedPrintAreaIntoView = () => {
    const allowedPrintArea = allowedPrintAreaRef.current
    if (!allowedPrintArea) return
    const wrapper = printAreaContainerWrapperRef.current
    if (!wrapper) return
    setScale(calculateMaxScaleForAllowedPrintArea(allowedPrintArea, wrapper))
  }

  const detectCollisionByAllowedPrintArea = () => {
    if (scale === createInitialConstants<number>('ELEMENT_ZOOM')) return
    const allowedPrintArea = allowedPrintAreaRef.current
    if (!allowedPrintArea) return
    const printAreaContainerWrapper = printAreaContainerWrapperRef.current
    if (!printAreaContainerWrapper) return

    // Lấy rect HIỆN TẠI (đã bao gồm translate + scale)
    const allowedPrintAreaRect = allowedPrintArea.getBoundingClientRect()
    const wrapperRect = printAreaContainerWrapper.getBoundingClientRect()

    let newX: number | null = null
    let newY: number | null = null

    // Phát hiện va chạm và tính OFFSET cần điều chỉnh
    if (allowedPrintAreaRect.left < wrapperRect.left) {
      const offset = wrapperRect.left - allowedPrintAreaRect.left + edgesMargin
      newX = translate.x + offset
    }
    if (allowedPrintAreaRect.right > wrapperRect.right) {
      const offset = allowedPrintAreaRect.right - wrapperRect.right + edgesMargin
      newX = translate.x - offset
    }
    if (allowedPrintAreaRect.top < wrapperRect.top) {
      const offset = wrapperRect.top - allowedPrintAreaRect.top + edgesMargin
      newY = translate.y + offset
    }
    if (allowedPrintAreaRect.bottom > wrapperRect.bottom) {
      const offset = allowedPrintAreaRect.bottom - wrapperRect.bottom + edgesMargin
      newY = translate.y - offset
    }

    // Nếu không va chạm, cố gắng đưa về vị trí trung tâm (translate = 0)
    if (newX === null) {
      newX = 0
      // Kiểm tra xem có thể về 0 không
      if (translate.x < 0 && allowedPrintAreaRect.right - translate.x > wrapperRect.right) {
        // Nếu về 0 thì right sẽ vượt quá → giữ lại một phần translate
        newX = translate.x + Math.abs(wrapperRect.right - allowedPrintAreaRect.right) - edgesMargin
      }
      if (translate.x > 0 && allowedPrintAreaRect.left - translate.x < wrapperRect.left) {
        // Nếu về 0 thì left sẽ vượt quá → giữ lại một phần translate
        newX = translate.x - Math.abs(allowedPrintAreaRect.left - wrapperRect.left) + edgesMargin
      }
    }
    if (newY === null) {
      newY = 0
      // Kiểm tra xem có thể về 0 không
      if (translate.y < 0 && allowedPrintAreaRect.bottom - translate.y > wrapperRect.bottom) {
        // Nếu về 0 thì bottom sẽ vượt quá → giữ lại một phần translate
        newY =
          translate.y + Math.abs(wrapperRect.bottom - allowedPrintAreaRect.bottom) - edgesMargin
      }
      if (translate.y > 0 && allowedPrintAreaRect.top - translate.y < wrapperRect.top) {
        // Nếu về 0 thì top sẽ vượt quá → giữ lại một phần translate
        newY = translate.y - Math.abs(allowedPrintAreaRect.top - wrapperRect.top) + -edgesMargin
      }
    }

    setTranslate({
      x: newX !== null ? newX : translate.x,
      y: newY !== null ? newY : translate.y,
    })
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        detectCollisionByAllowedPrintArea()
      })
    })
  }, [scale])

  // Zoom edit area khi printed images được build và mount xong
  useEffect(() => {
    if (!printedImagesBuildId) return
    if (preBuildIdRef.current === printedImagesBuildId) return
    preBuildIdRef.current = printedImagesBuildId
    // Đợi 1 frame để đảm bảo DOM đã mount xong
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        maxZoomAllowedPrintAreaIntoView()
      })
    })
  }, [printedImagesBuildId, printedImages.length])

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
