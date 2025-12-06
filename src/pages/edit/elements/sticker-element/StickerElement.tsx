import { TElementMountType, TStickerVisualState } from '@/utils/types/global'
import { useEffect, useRef, useState } from 'react'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useElementControl } from '@/hooks/element/use-element-control'
import { typeToObject } from '@/utils/helpers'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { useEditAreaStore } from '@/stores/ui/edit-area.store'
import { createPortal } from 'react-dom'

const MAX_ZOOM: number = 4
const MIN_ZOOM: number = 0.4
const DEFAULT_ELEMENT_DIMENSION_SIZE: number = 80

type TInteractiveButtonsState = {
  buttonsContainerStyle: { top: number; left: number; width: number; height: number }
  isShown: boolean
}

type TStickerElementProps = {
  element: TStickerVisualState
  allowedPrintAreaRef: React.RefObject<HTMLDivElement | null>
  mountType: TElementMountType
  isSelected: boolean
  selectElement: (elementId: string, elementType: 'sticker', path: string) => void
  removeStickerElement: (stickerElementId: string) => void
  printAreaContainerRef: React.RefObject<HTMLDivElement | null>
}

export const StickerElement = ({
  element,
  allowedPrintAreaRef,
  isSelected,
  selectElement,
  removeStickerElement,
  printAreaContainerRef,
}: TStickerElementProps) => {
  const { path, id, mountType, height, width } = element
  const rootRef = useRef<HTMLElement | null>(null)
  const scaleFactor = useEditAreaStore((state) => state.editAreaScaleValue)
  const {
    // forPinch: { ref: refForPinch },
    forRotate: { ref: refForRotate, rotateButtonRef },
    forZoom: { ref: refForZoom, zoomButtonRef },
    forDrag: { ref: refForDrag, dragButtonRef },
    state: { position, angle, scale, zindex },
    handleSetElementState,
  } = useElementControl(id, rootRef, allowedPrintAreaRef, printAreaContainerRef, {
    maxZoom: MAX_ZOOM,
    minZoom: MIN_ZOOM,
    angle: element.angle,
    scale: element.scale,
    position: element.position,
    zindex: element.zindex,
    mountType,
  })
  const [interactiveBtns, setInteractiveBtns] = useState<TInteractiveButtonsState>({
    buttonsContainerStyle: { top: 0, left: 0, width: 0, height: 0 },
    isShown: false,
  })

  const updateInteractiveButtonsVisual = () => {
    if (!isSelected) return
    const root = rootRef.current
    if (!root) return
    const rootRect = root.getBoundingClientRect()
    const { left, top, height, width } = rootRect
    const widthAfterScale = root.offsetWidth * scale * scaleFactor
    const heightAfterScale = root.offsetHeight * scale * scaleFactor
    setInteractiveBtns({
      buttonsContainerStyle: {
        top: top + height / 2 - heightAfterScale / 2,
        left: left + width / 2 - widthAfterScale / 2,
        width: widthAfterScale,
        height: heightAfterScale,
      },
      isShown: true,
    })
    // requestAnimationFrame(updateInteractiveButtonsVisual)
  }

  useEffect(() => {
    updateInteractiveButtonsVisual()
  }, [isSelected, position.x, position.y, scale, angle, zindex])

  const pickElement = () => {
    const root = rootRef.current
    if (!root) return
    // eventEmitter.emit(EInternalEvents.PICK_ELEMENT, id, root, 'sticker')
    selectElement(id, 'sticker', path)
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

  const moveElementIntoCenter = (
    root: HTMLElement,
    allowedPrintArea: HTMLElement,
    printAreaContainer: HTMLElement
  ) => {
    const allowedPrintAreaRect = allowedPrintArea.getBoundingClientRect()
    const rootRect = root.getBoundingClientRect()
    const printAreaContainerRect = printAreaContainer.getBoundingClientRect()
    handleSetElementState(
      (allowedPrintAreaRect.left +
        (allowedPrintAreaRect.width - rootRect.width) / 2 -
        printAreaContainerRect.left) /
        scaleFactor,
      (allowedPrintAreaRect.top +
        (allowedPrintAreaRect.height - rootRect.height) / 2 -
        printAreaContainerRect.top) /
        scaleFactor
    )
  }

  const initElementDisplaySize = (
    root: HTMLElement,
    allowedPrintArea: HTMLElement,
    moveToCenter?: boolean
  ) => {
    const display = root.querySelector<HTMLImageElement>('.NAME-element-display')
    if (!display) return
    display.onload = () => {
      const { naturalWidth, naturalHeight } = display
      if (naturalWidth > naturalHeight) {
        root.style.width = `${DEFAULT_ELEMENT_DIMENSION_SIZE}px`
        root.style.aspectRatio = `${naturalWidth} / ${naturalHeight}`
        root.style.height = 'auto'
      } else {
        root.style.height = `${DEFAULT_ELEMENT_DIMENSION_SIZE}px`
        root.style.aspectRatio = `${naturalWidth} / ${naturalHeight}`
        root.style.width = 'auto'
      }
      if (moveToCenter) {
        requestAnimationFrame(() => {
          if (printAreaContainerRef.current) {
            moveElementIntoCenter(root, allowedPrintArea, printAreaContainerRef.current)
          }
        })
      }
    }
    display.src = path
  }

  const initElement = () => {
    requestAnimationFrame(() => {
      const root = rootRef.current
      if (!root) return
      const allowedPrintArea = allowedPrintAreaRef.current
      if (!allowedPrintArea) return
      const printAreaContainer = printAreaContainerRef.current
      if (!printAreaContainer) return
      if (mountType === 'from-new') {
        initElementDisplaySize(root, allowedPrintArea, true)
      }
    })
  }

  const handleAddElementLayer = () => {
    useElementLayerStore.getState().addToElementLayers({ elementId: id, index: zindex })
  }

  const removeElement = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()
    e.preventDefault()
    removeStickerElement(id)
  }

  useEffect(() => {
    if (!isSelected) return
    eventEmitter.emit(EInternalEvents.SYNC_ELEMENT_PROPS, id, 'sticker')
  }, [scale, angle, position.x, position.y, isSelected, id])

  useEffect(() => {
    initElement()
    handleAddElementLayer()
    eventEmitter.on(EInternalEvents.SUBMIT_STICKER_ELE_PROPS, listenSubmitEleProps)
    return () => {
      eventEmitter.off(EInternalEvents.SUBMIT_STICKER_ELE_PROPS, listenSubmitEleProps)
    }
  }, [id])

  return (
    <div
      data-root-element-id={id}
      ref={(node) => {
        refForDrag.current = node
        rootRef.current = node
        refForRotate.current = node
        refForZoom.current = node
        // refForPinch.current = node
      }}
      style={{
        left: position.x,
        top: position.y,
        transform: `scale(${scale}) rotate(${angle}deg)`,
        zIndex: zindex,
        ...(mountType === 'from-new'
          ? { height: `${DEFAULT_ELEMENT_DIMENSION_SIZE}px` }
          : {
              height: `${height}px`,
              aspectRatio: `${width} / ${height}`,
            }),
      }}
      className={`NAME-root-element NAME-element-type-sticker absolute transition h-fit w-fit touch-none z-6`}
      onClick={pickElement}
      data-visual-state={JSON.stringify(
        typeToObject<TStickerVisualState>({
          id,
          path,
          position,
          scale,
          angle,
          zindex,
          height,
          width,
        })
      )}
      onDragStart={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className={`NAME-element-main-box select-none relative origin-center h-full w-full`}>
        <div className="h-full w-full">
          <img
            src={path}
            alt={`Sticker`}
            className="NAME-element-display object-contain h-full w-full"
          />
        </div>

        {createPortal(
          <div
            className="NAME-element-interactive-buttons fixed z-90 bg-transparent shadow-[0_0_0_2px_#f54900] touch-none"
            style={{
              display: isSelected && interactiveBtns.isShown ? 'block' : 'none',
              top: interactiveBtns.buttonsContainerStyle.top,
              left: interactiveBtns.buttonsContainerStyle.left,
              width: interactiveBtns.buttonsContainerStyle.width,
              height: interactiveBtns.buttonsContainerStyle.height,
              transform: `rotate(${angle}deg)`,
            }}
            ref={dragButtonRef}
          >
            <div
              className={`NAME-rotate-box origin-center absolute -top-7 -left-7 md:-top-8 md:-left-8`}
            >
              <button
                ref={rotateButtonRef}
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
            <div className={`NAME-remove-box absolute -bottom-7 -right-7 md:-bottom-8 md:-right-8`}>
              <button
                ref={zoomButtonRef}
                onPointerDownCapture={(e) => e.stopPropagation()}
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
