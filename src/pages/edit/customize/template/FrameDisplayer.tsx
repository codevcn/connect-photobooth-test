import {
  TPosition,
  TPrintedImage,
  TPrintTemplate,
  TStoredTemplate,
  TTemplateFrame,
} from '@/utils/types/global'
import { TemplateFrame } from './TemplateFrame'
import type React from 'react'
import { cn } from '@/configs/ui/tailwind-utils'
import { styleToFramesDisplayerByTemplateType } from '@/configs/print-template/templates-helpers'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTemplateStore } from '@/stores/ui/template.store'
import { useEditedElementStore } from '@/stores/element/element.store'
import { initFramePlacedImageByPrintedImage } from '../../helpers'
import { useSearchParams } from 'react-router-dom'
import { typeToObject } from '@/utils/helpers'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'

type TFramesDisplayerProps = {
  template: TPrintTemplate
  printedImages: TPrintedImage[]
} & Partial<{
  plusIconReplacer?: React.JSX.Element
  frameStyles: Partial<{
    container: React.CSSProperties
    plusIconWrapper: React.CSSProperties
  }>
  frameClassNames: Partial<{
    container: string
    plusIconWrapper: string
  }>
  displayerClassNames: {
    container: string
  }
  onClickFrame: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, frameId: string) => void
  displayScrollButton: boolean
  displaySelectingColor: boolean
  allowDragging: boolean
  scrollable: boolean
  containerScale: number
  displayZoomButton: boolean
}>

export const FramesDisplayer = ({
  template,
  plusIconReplacer,
  frameStyles,
  frameClassNames,
  displayerClassNames,
  onClickFrame,
  displayScrollButton = false,
  displaySelectingColor = false,
  allowDragging = true,
  scrollable = true,
  printedImages,
  containerScale = 1,
  displayZoomButton = false,
}: TFramesDisplayerProps) => {
  const { type } = template
  const mockupId = useSearchParams()[0].get('mockupId')
  const pickedProductId = useProductUIDataStore((s) => s.pickedProduct?.id)
  const restoredOffsetYRef = useRef(0)
  const hasRestoredRef = useRef(false)

  const restoreOffsetY = () => {
    requestAnimationFrame(() => {
      if (restoredOffsetYRef.current !== 0) {
        setPosition((pos) => {
          if (pos.y !== restoredOffsetYRef.current) {
            return { ...pos, y: restoredOffsetYRef.current }
          }
          return pos
        })
      }
    })
  }

  const containerRef = useRef<HTMLDivElement>(null)
  const elementsBoxRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<TPosition>({ x: 0, y: 0 })

  const stopDraggingByZoomPlacedImageButton = (
    e: Event | React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    return e.target instanceof Element && e.target.closest('.NAME-zoom-placed-image-btn-wrapper')
  }

  // Tính toán biên của container B dựa trên tất cả các thẻ con C
  const calculateBoundingBox = (e: Event) => {
    const containerB = elementsBoxRef.current
    if (!containerB) return null

    const children = containerB.querySelectorAll<HTMLElement>('.NAME-frame-placed-image')
    if (children.length === 0) return null

    let minX = Infinity,
      minY = Infinity
    let maxX = -Infinity,
      maxY = -Infinity

    for (const child of children) {
      const rect = child.getBoundingClientRect()
      const bRect = containerB.getBoundingClientRect()

      // Tính toán vị trí tương đối so với container B
      const relativeLeft = rect.left - bRect.left
      const relativeTop = rect.top - bRect.top
      const relativeRight = relativeLeft + rect.width
      const relativeBottom = relativeTop + rect.height

      minX = Math.min(minX, relativeLeft)
      minY = Math.min(minY, relativeTop)
      maxX = Math.max(maxX, relativeRight)
      maxY = Math.max(maxY, relativeBottom)
    }

    return {
      left: minX,
      top: minY,
      right: maxX,
      bottom: maxY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (stopDraggingByZoomPlacedImageButton(e)) return
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (stopDraggingByZoomPlacedImageButton(e)) return
    if (!isDragging) return

    const containerA = containerRef.current
    const containerB = elementsBoxRef.current
    if (!containerA || !containerB) return

    // Tính toán vị trí mới
    let newX = e.clientX - dragStart.current.x
    let newY = e.clientY - dragStart.current.y

    // Lấy kích thước container A
    const aRect = containerA.getBoundingClientRect()
    const aWidth = aRect.width
    const aHeight = aRect.height

    // Lấy biên của container B dựa trên các thẻ con C
    const bBounds = calculateBoundingBox(e)

    if (bBounds) {
      // Giới hạn di chuyển dựa trên biên của các thẻ con C
      // Biên trái: không cho phép biên trái của C vượt qua biên trái của A
      const minX = -bBounds.left
      // Biên phải: không cho phép biên phải của C vượt qua biên phải của A
      const maxX = aWidth - bBounds.right
      // Biên trên: không cho phép biên trên của C vượt qua biên trên của A
      const minY = -bBounds.top
      // Biên dưới: không cho phép biên dưới của C vượt qua biên dưới của A
      const maxY = aHeight - bBounds.bottom

      newX = Math.max(minX, Math.min(maxX, newX))
      newY = Math.max(minY, Math.min(maxY, newY))
    }

    setPosition({ x: newX / containerScale, y: newY / containerScale })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('mockupId') && !hasRestoredRef.current) {
      restoredOffsetYRef.current = template.initialVisualState?.offsetY || 0
      restoreOffsetY()
      hasRestoredRef.current = true
    }
  }, [pickedProductId, template.id])

  useEffect(() => {
    setPosition({ x: 0, y: 0 })
  }, [template.id, pickedProductId])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handleMouseMove)
      window.addEventListener('pointerup', handleMouseUp)
      return () => {
        window.removeEventListener('pointermove', handleMouseMove)
        window.removeEventListener('pointerup', handleMouseUp)
      }
    }
  }, [isDragging, position])

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <div
        ref={elementsBoxRef}
        onPointerDown={handleMouseDown}
        className={cn(
          'NAME-frames-displayer absolute p-0.5 h-full w-full',
          displayerClassNames?.container
        )}
        style={{
          ...styleToFramesDisplayerByTemplateType(type),
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        data-visual-state={JSON.stringify(
          typeToObject<Pick<TStoredTemplate, 'initialVisualState'>>({
            initialVisualState: { offsetY: position.y },
          })
        )}
      >
        {template.frames.map((frame, idx) => (
          <TemplateFrame
            key={frame.id}
            templateFrame={frame}
            templateType={type}
            plusIconReplacer={plusIconReplacer}
            styles={frameStyles}
            classNames={frameClassNames}
            onClickFrame={onClickFrame}
            childIndex={idx}
            displaySelectingColor={displaySelectingColor}
            scrollable={scrollable}
            displayZoomButton={displayZoomButton}
            onImageLoad={() => {
              // Chỉ restore lần đầu khi load từ mockupId
              if (mockupId && !hasRestoredRef.current && restoredOffsetYRef.current !== 0) {
                restoreOffsetY()
                hasRestoredRef.current = true
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}
