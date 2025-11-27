import {
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
}>

type TFrameBounds = {
  min: number // offsetY nhỏ nhất (kéo lên)
  max: number // offsetY lớn nhất (kéo xuống)
}

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
}: TFramesDisplayerProps) => {
  const { type } = template
  const mockupId = useSearchParams()[0].get('mockupId')
  const pickedTemplate = useTemplateStore((s) => s.pickedTemplate)
  const storedTemplate = useEditedElementStore((s) => s.storedTemplate)
  const didSetStoredTemplate = useEditedElementStore((s) => s.didSetStoredTemplate)
  const [offsetY, setOffsetY] = useState(0) // margin-top động
  const [dragging, setDragging] = useState(false)
  const restoredOffsetYRef = useRef(0)
  const startYRef = useRef(0)
  const startOffsetRef = useRef(0)
  const [framesBounds, setFramesBounds] = useState<Record<string, TFrameBounds>>({})

  const finalFrames = useMemo<TTemplateFrame[]>(() => {
    console.log('>>> [now] toyyy vcn:', {
      didSetStoredTemplate,
      storedTemplate,
      template,
    })
    if (!mockupId) return template.frames
    if (!didSetStoredTemplate) return []
    let frames = storedTemplate ? storedTemplate.frames : template.frames
    if (storedTemplate) {
      restoredOffsetYRef.current = storedTemplate.offsetY
    }
    return frames
  }, [didSetStoredTemplate, storedTemplate, template])

  const restoreOffsetY = () => {
    requestAnimationFrame(() => {
      if (restoredOffsetYRef.current) setOffsetY(restoredOffsetYRef.current)
    })
  }

  useEffect(() => {
    restoreOffsetY()
  }, [])

  // hàm clamp offsetY theo tất cả frames
  const clampOffset = (value: number) => {
    const allBounds = Object.values(framesBounds)
    if (!allBounds.length) return value

    // giao nhau của các khoảng [min, max]
    const min = Math.max(...allBounds.map((b) => b.min))
    const max = Math.min(...allBounds.map((b) => b.max))

    if (min > max) return value // nếu config sai, thôi kệ :v

    if (value < min) return min
    if (value > max) return max
    return value
  }

  const onPointerDown = (e: React.PointerEvent, frameId: string) => {
    if (!allowDragging) return
    if (useTemplateStore.getState().pickedTemplate?.frames.some((f) => !f.placedImage)) return
    setDragging(true)
    startYRef.current = e.clientY
    startOffsetRef.current = offsetY
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const displayerRef = useRef<HTMLDivElement | null>(null)
  const listChildRef = useRef<Array<HTMLDivElement | null>>([])

  const registerChild = (index: number, el: HTMLImageElement | null) => {
    listChildRef.current[index] = el
  }

  useEffect(() => {
    setOffsetY(0)
  }, [pickedTemplate])

  const handleCanMove = () => {
    const parent = displayerRef.current
    if (!parent) return 0

    const parentRect = parent.getBoundingClientRect()
    let minTop = 0
    let maxBottom = 0
    for (const child of listChildRef.current) {
      if (!child) continue
      const childRect = child.getBoundingClientRect()

      const topDiff = childRect.top - parentRect.top
      const bottomDiff = childRect.bottom - parentRect.bottom

      if (topDiff < minTop) {
        minTop = topDiff
      }
      if (bottomDiff > maxBottom) {
        maxBottom = bottomDiff
      }
    }

    return minTop + maxBottom
  }
  useEffect(() => {
    const canMove = handleCanMove()
    if (canMove != 0) {
      setOffsetY((pre) => pre - canMove)
    }
  }, [offsetY])

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!dragging) return
      const delta = e.clientY - startYRef.current
      const next = startOffsetRef.current + delta

      setOffsetY((prev) => clampOffset(next))
    }

    const handleUp = () => {
      if (!dragging) return
      setDragging(false)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [dragging, framesBounds])

  return (
    <div ref={displayerRef} className="relative w-full h-full overflow-hidden">
      <div
        className={cn(
          'NAME-frames-displayer relative p-0.5 h-full w-full',
          displayerClassNames?.container
        )}
        style={{ ...styleToFramesDisplayerByTemplateType(type), marginTop: offsetY }}
        data-visual-state={JSON.stringify(
          typeToObject<Pick<TStoredTemplate, 'offsetY'>>({
            offsetY,
          })
        )}
      >
        {finalFrames.map((frame, idx) => (
          <TemplateFrame
            key={frame.id}
            templateFrame={frame}
            templateType={type}
            plusIconReplacer={plusIconReplacer}
            styles={frameStyles}
            classNames={frameClassNames}
            onClickFrame={onClickFrame}
            registerChild={registerChild}
            childIndex={idx}
            onPointerDown={onPointerDown}
            displaySelectingColor={displaySelectingColor}
            scrollable={scrollable}
            onImageLoad={() => {
              restoreOffsetY()
            }}
          />
        ))}
      </div>
    </div>
  )
}
