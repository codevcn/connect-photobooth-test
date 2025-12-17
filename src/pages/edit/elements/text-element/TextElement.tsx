import { TElementMountType, TTextVisualState } from '@/utils/types/global'
import { useEffect, useRef, useState } from 'react'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useTextElementControl } from '@/hooks/element/use-text-element-control'
import { typeToObject } from '@/utils/helpers'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { useEditAreaStore } from '@/stores/ui/edit-area.store'
import { useEditedElementStore } from '@/stores/element/element.store'
import { createPortal } from 'react-dom'
import { persistElementPositionToPrintArea } from '../helpers'

const MAX_TEXT_FONT_SIZE: number = 128
const MIN_TEXT_FONT_SIZE: number = 10

type TInteractiveButtonsState = {
  buttonsContainerStyle: { top: number; left: number; width: number; height: number }
  isShown: boolean
}

type TTextElementProps = {
  element: TTextVisualState
  allowedPrintAreaRef: React.RefObject<HTMLDivElement | null>
  mountType: TElementMountType
  isSelected: boolean
  selectElement: (elementId: string, elementType: 'text') => void
  removeTextElement: (textElementId: string) => void
  printAreaContainerRef: React.RefObject<HTMLDivElement | null>
  elementControlRef: React.RefObject<{ todo: (param: any) => void }> | null
}

export const TextElement = ({
  element,
  allowedPrintAreaRef,
  isSelected,
  selectElement,
  removeTextElement,
  printAreaContainerRef,
  elementControlRef,
}: TTextElementProps) => {
  const { id, mountType } = element
  const rootRef = useRef<HTMLElement | null>(null)
  const scaleFactor = useEditAreaStore((state) => state.editAreaScaleValue)
  const clipPolygon = useEditedElementStore((state) => state.clippedElements[id]?.polygon || null)
  const {
    // forPinch: { ref: refForPinch },
    forRotate: { ref: refForRotate, rotateButtonRef },
    forZoom: { ref: refForZoom, zoomButtonRef },
    forDrag: { ref: refForDrag, dragButtonRef, dragButtonSelfElementRef },
    state: { position, angle, zindex, fontSize, textColor, content, fontFamily, fontWeight, scale },
    handleSetElementState,
  } = useTextElementControl(
    id,
    rootRef,
    allowedPrintAreaRef,
    printAreaContainerRef,
    elementControlRef,
    {
      maxFontSize: MAX_TEXT_FONT_SIZE,
      minFontSize: MIN_TEXT_FONT_SIZE,
      position: element.position,
      angle: element.angle,
      fontSize: element.fontSize,
      textColor: element.textColor,
      content: element.content,
      zindex: element.zindex,
      fontFamily: element.fontFamily,
      fontWeight: element.fontWeight,
      scale: element.scale,
      mountType,
    }
  )
  const interactionsRef = useRef<HTMLElement>(null)

  const updateInteractiveButtonsVisualDirectly = (): React.CSSProperties => {
    const root = rootRef.current
    if (!root) return {}
    const rootRect = root.getBoundingClientRect()
    const { left, top } = rootRect
    const widthAfterScale = fontSize * content.length * 0.59 * scaleFactor // 0.59 là giá trị chiều dài trung bình cho 1 ký tự trong font chữ Arial (font chữ mặc định của ứng dụng)
    const heightAfterScale = fontSize * scaleFactor // 1.2 là line-height mặc định
    return {
      display: isSelected ? 'block' : 'none',
      top: top + rootRect.height / 2 - heightAfterScale / 2,
      left: left + rootRect.width / 2 - widthAfterScale / 2,
      width: widthAfterScale,
      height: heightAfterScale,
    }
  }

  const updateInteractiveButtonsVisual = () => {
    const root = rootRef.current
    if (!root) return
    const interactions = interactionsRef.current
    if (!interactions) return
    const rootRect = root.getBoundingClientRect()
    const { left, top } = rootRect
    const widthAfterScale = fontSize * content.length * 0.59 * scaleFactor // 0.59 là giá trị chiều dài trung bình cho 1 ký tự trong font chữ Arial (font chữ mặc định của ứng dụng)
    const heightAfterScale = fontSize * scaleFactor // 1.2 là line-height mặc định
    interactions.style.display = isSelected ? 'block' : 'none'
    interactions.style.top = `${top + rootRect.height / 2 - heightAfterScale / 2}px`
    interactions.style.left = `${left + rootRect.width / 2 - widthAfterScale / 2}px`
    interactions.style.width = `${widthAfterScale}px`
    interactions.style.height = `${heightAfterScale}px`
  }

  useEffect(() => {
    if (!content) {
      removeTextElement(id)
      return
    }
  }, [content, id])

  const pickElement = () => {
    const root = rootRef.current
    if (!root) return
    // eventEmitter.emit(EInternalEvents.PICK_ELEMENT, element.id, root, 'text')
    selectElement(id, 'text')
  }

  const listenSubmitEleProps = (
    elementId: string | null,
    fontSize?: number,
    angle?: number,
    posX?: number,
    posY?: number,
    zindex?: number,
    textColor?: string,
    content?: string,
    fontFamily?: string
  ) => {
    if (elementId === id) {
      handleSetElementState(
        posX,
        posY,
        undefined,
        angle,
        zindex,
        fontSize,
        textColor,
        content,
        fontFamily
      )
    }
  }

  const removeElement = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()
    e.preventDefault()
    removeTextElement(id)
    useElementLayerStore.getState().removeElementLayers([id])
  }

  useEffect(() => {
    if (!isSelected) return
    eventEmitter.emit(EInternalEvents.SYNC_ELEMENT_PROPS, id, 'text')
  }, [fontSize, angle, position, isSelected, id])

  useEffect(() => {
    window.addEventListener('resize', updateInteractiveButtonsVisual)
    window.addEventListener('scroll', updateInteractiveButtonsVisual)
    return () => {
      window.removeEventListener('resize', updateInteractiveButtonsVisual)
      window.removeEventListener('scroll', updateInteractiveButtonsVisual)
    }
  }, [isSelected, fontSize, content, id, scaleFactor])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.SUBMIT_TEXT_ELE_PROPS, listenSubmitEleProps)
    return () => {
      eventEmitter.off(EInternalEvents.SUBMIT_TEXT_ELE_PROPS, listenSubmitEleProps)
    }
  }, [id])

  return (
    <div
      data-root-element-id={id}
      ref={(node) => {
        rootRef.current = node
        refForDrag.current = node
        refForRotate.current = node
        refForZoom.current = node
        dragButtonSelfElementRef.current = node
        // refForPinch.current = node
      }}
      style={{
        left: position.x,
        top: position.y,
        transform: `rotate(${angle}deg)`,
        zIndex: zindex,
      }}
      className={`NAME-root-element NAME-element-type-text absolute h-fit w-fit touch-none z-6`}
      onPointerDown={pickElement}
      data-visual-state={JSON.stringify(
        typeToObject<TTextVisualState>({
          id,
          position,
          angle,
          zindex,
          fontSize,
          textColor,
          content,
          fontFamily,
          fontWeight,
          scale,
          clippath: clipPolygon || undefined,
        })
      )}
      data-persist-position={JSON.stringify(
        persistElementPositionToPrintArea(rootRef.current, allowedPrintAreaRef.current, scale)
      )}
      onDragStart={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
      onDragOver={(e) => e.preventDefault()}
    >
      <div
        style={{
          clipPath: clipPolygon || 'none',
        }}
        className={`NAME-element-main-box relative origin-center text-inherit`}
      >
        <div className="h-full w-full">
          <p
            style={{
              fontSize: `${fontSize}px`,
              color: textColor,
              fontFamily,
              fontWeight,
            }}
            className="NAME-displayed-text-content font-bold whitespace-nowrap select-none leading-none"
          >
            {content}
          </p>
        </div>

        {createPortal(
          <div
            className="NAME-element-interactive-buttons fixed z-80 bg-transparent shadow-[0_0_0_2px_var(--vcn-main-cl)] touch-none"
            style={{
              ...updateInteractiveButtonsVisualDirectly(),
              transform: `rotate(${angle}deg)`,
            }}
            ref={(node) => {
              dragButtonRef.current = node
              interactionsRef.current = node
            }}
          >
            <div
              className={`NAME-rotate-box origin-center absolute -top-7 -left-7 md:-top-8 md:-left-8`}
            >
              <button
                ref={(node) => {
                  rotateButtonRef.current = node
                }}
                // onPointerDownCapture={(e) => e.stopPropagation()}
                className="cursor-grab active:cursor-grabbing bg-main-cl text-white rounded-full p-1 active:scale-90 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-rotate-cw-icon lucide-rotate-cw h-[18px] w-[18px] md:w-5 md:h-5"
                >
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
              </button>
            </div>
            <div className={`NAME-zoom-box absolute -bottom-7 -right-7 md:-bottom-8 md:-right-8`}>
              <button
                ref={(node) => {
                  zoomButtonRef.current = node
                }}
                // onPointerDownCapture={(e) => e.stopPropagation()}
                style={{ transform: `rotateY(180deg)` }}
                className="cursor-grab active:cursor-grabbing bg-main-cl text-white rounded-full p-1 active:scale-90 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-scaling-icon lucide-scaling h-[18px] w-[18px] md:w-5 md:h-5"
                >
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M14 15H9v-5" />
                  <path d="M16 3h5v5" />
                  <path d="M21 3 9 15" />
                </svg>
              </button>
            </div>
            <div className={`NAME-remove-box absolute -top-7 -right-7 md:-top-8 md:-right-8`}>
              <button
                onClick={removeElement}
                onPointerDownCapture={(e) => e.stopPropagation()}
                className="bg-red-600 text-white rounded-full p-1 active:scale-90 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x-icon lucide-x h-[18px] w-[18px] md:w-5 md:h-5"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  )
}
