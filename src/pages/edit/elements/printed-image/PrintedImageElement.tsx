import { TElementMountType, TPrintedImageVisualState } from '@/utils/types/global'
import { useEffect, useRef } from 'react'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useElementControl } from '@/hooks/element/use-element-control'
import { typeToObject } from '@/utils/helpers'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { useEditAreaStore } from '@/stores/ui/edit-area.store'
import { useEditedElementStore } from '@/stores/element/element.store'
import { createPortal } from 'react-dom'
import { persistElementPositionToPrintArea } from '../helpers'

const MAX_ZOOM: number = 12
const MIN_ZOOM: number = 0.2

type TPrintedImageElementProps = {
  element: TPrintedImageVisualState
  allowedPrintAreaRef: React.RefObject<HTMLDivElement | null>
  mountType: TElementMountType
  isSelected: boolean
  selectElement: (elementId: string, elementType: 'printed-image', path: string) => void
  removePrintedImageElement: (printedImageElementId: string) => void
  printAreaContainerRef: React.RefObject<HTMLDivElement | null>
  elementControlRef: React.RefObject<{ todo: (param: any) => void }> | null
}

export const PrintedImageElement = ({
  element,
  allowedPrintAreaRef,
  isSelected,
  selectElement,
  removePrintedImageElement,
  printAreaContainerRef,
  elementControlRef,
}: TPrintedImageElementProps) => {
  const { path, id, mountType, height, width, grayscale, isInitWithLayout, matchOrientation } =
    element
  const rootRef = useRef<HTMLElement | null>(null)
  const scaleFactor = useEditAreaStore((state) => state.editAreaScaleValue)
  const clipPolygon = useEditedElementStore((state) => state.clippedElements[id]?.polygon || null)
  const {
    // forPinch: { ref: refForPinch },
    forRotate: { ref: refForRotate, rotateButtonRef },
    forZoom: { ref: refForZoom, zoomButtonRef },
    forDrag: { ref: refForDrag, dragButtonRef, dragButtonSelfElementRef },
    state: { position, angle, scale, zindex },
    handleSetElementState,
  } = useElementControl(id, rootRef, allowedPrintAreaRef, printAreaContainerRef, 'printed-image', {
    maxZoom: MAX_ZOOM,
    minZoom: MIN_ZOOM,
    angle: element.angle,
    scale: element.scale,
    position: element.position,
    zindex: element.zindex,
    mountType,
  })
  const interactionsRef = useRef<HTMLElement>(null)

  const updateInteractiveButtonsVisualDirectly = (): React.CSSProperties => {
    const root = rootRef.current
    if (!root) return {}
    const rootRect = root.getBoundingClientRect()
    const { left, top, height, width } = rootRect
    const widthAfterScale = root.offsetWidth * scale * scaleFactor
    const heightAfterScale = root.offsetHeight * scale * scaleFactor
    return {
      display: isSelected ? 'block' : 'none',
      top: top + height / 2 - heightAfterScale / 2,
      left: left + width / 2 - widthAfterScale / 2,
      width: widthAfterScale,
      height: heightAfterScale,
    }
  }

  const updateInteractiveButtonsVisual = () => {
    const root = rootRef.current
    if (!root) return
    const rootRect = root.getBoundingClientRect()
    const { left, top, height, width } = rootRect
    const widthAfterScale = root.offsetWidth * scale * scaleFactor
    const heightAfterScale = root.offsetHeight * scale * scaleFactor
    const interactions = interactionsRef.current
    if (!interactions) return
    interactions.style.top = `${top + height / 2 - heightAfterScale / 2}px`
    interactions.style.left = `${left + width / 2 - widthAfterScale / 2}px`
    interactions.style.width = `${widthAfterScale}px`
    interactions.style.height = `${heightAfterScale}px`
  }

  const pickElement = () => {
    const root = rootRef.current
    if (!root) return
    // eventEmitter.emit(EInternalEvents.PICK_ELEMENT, id, root, 'printed-image')
    selectElement(id, 'printed-image', path)
  }

  const listenSubmitEleProps = (
    elementId: string | null,
    scale?: number,
    angle?: number,
    posX?: number,
    posY?: number,
    zindex?: number
  ) => {
    if (elementId === id) {
      handleSetElementState(posX, posY, scale, angle, zindex)
    }
  }

  const removeElement = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()
    e.preventDefault()
    removePrintedImageElement(id)
    useElementLayerStore.getState().removeElementLayers([id])
  }

  useEffect(() => {
    if (!isSelected) return
    eventEmitter.emit(EInternalEvents.SYNC_ELEMENT_PROPS, id, 'printed-image')
  }, [scale, angle, position.x, position.y, isSelected, id])

  useEffect(() => {
    window.addEventListener('resize', updateInteractiveButtonsVisual)
    window.addEventListener('scroll', updateInteractiveButtonsVisual)
    return () => {
      window.removeEventListener('resize', updateInteractiveButtonsVisual)
      window.removeEventListener('scroll', updateInteractiveButtonsVisual)
    }
  }, [isSelected, id, scaleFactor, scale])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.SUBMIT_PRINTED_IMAGE_ELE_PROPS, listenSubmitEleProps)
    return () => {
      eventEmitter.off(EInternalEvents.SUBMIT_PRINTED_IMAGE_ELE_PROPS, listenSubmitEleProps)
    }
  }, [id])

  return (
    <div
      data-root-element-id={id}
      ref={(node) => {
        rootRef.current = node
        refForDrag.current = node
        dragButtonSelfElementRef.current = node
        refForRotate.current = node
        refForZoom.current = node
      }}
      style={{
        left: position.x,
        top: position.y,
        transform: `scale(${scale}) rotate(${angle}deg)`,
        zIndex: zindex,
        height: `${height}px`,
        width: `${width}px`,
      }}
      className={`NAME-root-element NAME-element-type-printed-image absolute h-fit w-fit touch-none z-6`}
      onPointerDown={pickElement}
      data-visual-state={JSON.stringify(
        typeToObject<TPrintedImageVisualState>({
          id,
          path,
          position,
          scale,
          angle,
          zindex,
          height,
          grayscale: grayscale || 0,
          width,
          isInitWithLayout,
          matchOrientation,
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
        className={`NAME-element-main-box select-none relative origin-center h-full w-full`}
      >
        <div
          className="NAME-element-display-wrapper h-full w-full"
          style={{
            filter: `grayscale(${grayscale || 0}%)`,
          }}
        >
          <img
            src={path}
            alt={`Printed Image`}
            className="NAME-element-display object-contain h-full w-full"
          />
        </div>
      </div>

      {createPortal(
        <div
          className="NAME-element-interactive-buttons hidden fixed z-99 bg-transparent shadow-[0_0_0_2px_var(--vcn-main-cl)] touch-none"
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
            className={`NAME-rotate-box origin-center absolute -top-7 -left-7 md:-top-8 md:-left-8 5xl:-top-10 5xl:-left-10`}
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
                className="lucide lucide-rotate-cw-icon lucide-rotate-cw h-[18px] w-[18px] md:w-5 md:h-5 5xl:w-8 5xl:h-8"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>
          </div>
          <div
            className={`NAME-remove-box absolute -bottom-7 -right-7 md:-bottom-8 md:-right-8 5xl:-bottom-10 5xl:-right-10`}
          >
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
                className="lucide lucide-scaling-icon lucide-scaling h-[18px] w-[18px] md:w-5 md:h-5 5xl:w-8 5xl:h-8"
              >
                <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M14 15H9v-5" />
                <path d="M16 3h5v5" />
                <path d="M21 3 9 15" />
              </svg>
            </button>
          </div>
          <div
            className={`NAME-remove-box absolute -top-7 -right-7 md:-top-8 md:-right-8 5xl:-top-10 5xl:-right-10`}
          >
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
                className="lucide lucide-x-icon lucide-x h-[18px] w-[18px] md:w-5 md:h-5 5xl:w-8 5xl:h-8"
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
  )
}
