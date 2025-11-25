import { TPrintTemplate } from '@/utils/types/global'
import { TemplateFrame } from './TemplateFrame'
import type React from 'react'
import { cn } from '@/configs/ui/tailwind-utils'
import { styleToFramesDisplayerByTemplateType } from '@/configs/print-template/templates-helpers'
import { useEffect, useRef, useState } from 'react'
import { useTemplateStore } from '@/stores/ui/template.store'

type TFramesDisplayerProps = {
  template: TPrintTemplate
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
}: TFramesDisplayerProps) => {
  const { frames, type } = template
  const pickedTemplate = useTemplateStore((s) => s.pickedTemplate)
  const [offsetY, setOffsetY] = useState(0) // margin-top động
  const [dragging, setDragging] = useState(false)
  const startYRef = useRef(0)
  const startOffsetRef = useRef(0)

  const [framesBounds, setFramesBounds] = useState<Record<string, TFrameBounds>>({})

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
    setOffsetY((pre) => pre - canMove)
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
          'relative NAME-frames-displayer p-0.5 h-full w-full',
          displayerClassNames?.container
        )}
        style={{ ...styleToFramesDisplayerByTemplateType(type), marginTop: offsetY }}
      >
        {/* {displayScrollButton && (
          <button
            type="button"
            className="absolute -left-8 top-1/2 -translate-y-1/2 cursor-row-resize select-none"
            onMouseDown={handleMouseDown}
          >
            <svg
              className="shadow-lg"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="-9 0 32 32"
            >
              <path
                fill="#fff"
                fillRule="evenodd"
                d="M12 24H9V8h3c.643 0 1.293.02 1.687-.38.393-.39.393-1.02 0-1.42L7.747.28A.968.968 0 0 0 6.984 0a.968.968 0 0 0-.762.28L.283 6.2c-.393.4-.393 1.03 0 1.42C.676 8.02 1.294 8 2 8h3v16H2c-.643 0-1.324-.02-1.717.38a1.002 1.002 0 0 0 0 1.42l5.939 5.92c.21.21.488.3.762.28.275.02.553-.07.763-.28l5.94-5.92c.393-.4.393-1.03 0-1.42-.394-.4-.95-.38-1.687-.38"
              />
            </svg>
          </button>
        )} */}
        {frames.map((frame, idx) => (
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
          />
        ))}
      </div>
    </div>
  )
}
