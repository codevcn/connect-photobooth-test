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
}: TFramesDisplayerProps) => {
  const { type } = template
  const mockupId = useSearchParams()[0].get('mockupId')
  const pickedProductId = useProductUIDataStore((s) => s.pickedProduct?.id)
  const [offsetY, setOffsetY] = useState(0) // margin-top động
  const [dragging, setDragging] = useState(false)
  const restoredOffsetYRef = useRef(0)
  const startYRef = useRef(0)
  const startOffsetRef = useRef(0)

  const restoreOffsetY = () => {
    requestAnimationFrame(() => {
      console.log('>>> [fff] res gg:', restoredOffsetYRef.current)
      if (restoredOffsetYRef.current !== 0) {
        setOffsetY(restoredOffsetYRef.current)
      }
    })
  }

  const hasRestoredRef = useRef(false)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('mockupId') && !hasRestoredRef.current) {
      restoredOffsetYRef.current = template.initialVisualState?.offsetY || 0
      restoreOffsetY()
      hasRestoredRef.current = true
    }
  }, [pickedProductId, template.id])

  const onPointerDown = (e: React.PointerEvent, frameId: string): void => {
    console.log('>>> [fff] on Pointer Down 1:', { allowDragging })
    if (!allowDragging) return
    if (useTemplateStore.getState().pickedTemplate?.frames.some((f) => !f.placedImage)) return
    setDragging(true)
    startYRef.current = e.clientY
    console.log('>>> [fff] on Pointer Down 2:', { offsetY })
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
  }, [template.id, pickedProductId])

  const handleCanMove = (
    preOffsetY: number,
    nextOffsetY: number,
    direction: 'up' | 'down'
  ): number => {
    const parent = displayerRef.current
    if (!parent) return nextOffsetY
    const parentRect = parent.getBoundingClientRect()
    let limitedTopChildRect: DOMRect | null = null
    let limitedBottomChildRect: DOMRect | null = null
    let limitedTop = Infinity
    let limitedBottom = Infinity
    for (const child of listChildRef.current) {
      if (!child) continue
      const childRect = child.getBoundingClientRect()
      const topDiff = childRect.top - parentRect.top
      const bottomDiff = parentRect.bottom - childRect.bottom
      console.log('>>> [fff1] diff 777:', { topDiff, bottomDiff })
      if (topDiff < limitedTop) {
        limitedTop = topDiff
        limitedTopChildRect = childRect
      }
      if (bottomDiff < limitedBottom) {
        limitedBottom = bottomDiff
        limitedBottomChildRect = childRect
      }
      // const topDiff =
      //   childRect.top - parentRect.top < 0 ? parentRect.top : childRect.top - parentRect.top
      // const bottomDiff =
      //   childRect.bottom - parentRect.bottom > 0
      //     ? parentRect.bottom
      //     : childRect.bottom - parentRect.bottom
      // if (topDiff < minTopRef.current) {
      //   minTopRef.current = topDiff
      // }
      // if (bottomDiff > maxBottomRef.current) {
      //   maxBottomRef.current = bottomDiff
      // }
    }
    console.log('>>> [fff1] limited:', { limitedTopChildRect, limitedBottomChildRect, parentRect })
    if (!limitedTopChildRect || !limitedBottomChildRect) return nextOffsetY
    const totalTopDiff = limitedTopChildRect.top - parentRect.top
    const totalBottomDiff = parentRect.bottom - limitedBottomChildRect.bottom
    console.log('>>> [fff1] total:', { totalTopDiff, totalBottomDiff, preOffsetY, nextOffsetY })
    if (direction === 'up' && totalTopDiff < 0) return preOffsetY
    if (direction === 'down' && totalBottomDiff < 0) return preOffsetY
    //  if (-nextOffsetY > minTopRef.current) return -minTopRef.current
    // if (-nextOffsetY < maxBottomRef.current) return -maxBottomRef.current
    return nextOffsetY
  }

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!dragging) return
      const delta = e.clientY - startYRef.current
      const next = startOffsetRef.current + delta

      setOffsetY((prev) => {
        const canMoveOffsetY = handleCanMove(prev, next, delta < 0 ? 'up' : 'down')
        console.log('>>> [fff] can move y:', canMoveOffsetY)
        return canMoveOffsetY
      })
    }

    const handleUp = (e: Event) => {
      if (!dragging) return
      setDragging(false)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [dragging])

  return (
    <div ref={displayerRef} className="relative w-full h-full overflow-hidden">
      <div
        className={cn(
          'NAME-frames-displayer relative p-0.5 h-full w-full',
          displayerClassNames?.container
        )}
        style={{ ...styleToFramesDisplayerByTemplateType(type), marginTop: offsetY }}
        data-visual-state={JSON.stringify(
          typeToObject<Pick<TStoredTemplate, 'initialVisualState'>>({
            initialVisualState: { offsetY },
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
            registerChild={registerChild}
            childIndex={idx}
            onPointerDown={onPointerDown}
            displaySelectingColor={displaySelectingColor}
            scrollable={scrollable}
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
