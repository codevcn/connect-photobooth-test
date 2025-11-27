import { TElementMountType, TStickerVisualState } from '@/utils/types/global'
import { useCallback, useEffect, useRef } from 'react'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useElementControl } from '@/hooks/element/use-element-control'
import { getNaturalSizeOfImage, typeToObject } from '@/utils/helpers'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { captureCurrentElementPosition } from '../../helpers'

const MAX_ZOOM: number = 4
const MIN_ZOOM: number = 0.2

type TStickerElementProps = {
  element: TStickerVisualState
  elementContainerRef: React.RefObject<HTMLDivElement | null>
  mountType: TElementMountType
  isSelected: boolean
  selectElement: (
    elementId: string,
    element: HTMLElement,
    elementType: 'sticker',
    path: string
  ) => void
  removeStickerElement: (stickerElementId: string) => void
  printAreaContainerRef: React.RefObject<HTMLDivElement | null>
}

export const StickerElement = ({
  element,
  elementContainerRef,
  isSelected,
  selectElement,
  removeStickerElement,
  printAreaContainerRef,
}: TStickerElementProps) => {
  console.log('>>> [now] element sticker:', element)
  const { path, id, mountType, height, width } = element
  const rootRef = useRef<HTMLElement | null>(null)
  const {
    forPinch: { ref: refForPinch },
    forRotate: { ref: refForRotate, rotateButtonRef },
    forZoom: { ref: refForZoom, zoomButtonRef },
    forDrag: { ref: refForDrag },
    state: { position, angle, scale, zindex },
    handleSetElementState,
  } = useElementControl(id, rootRef, printAreaContainerRef, {
    maxZoom: MAX_ZOOM,
    minZoom: MIN_ZOOM,
    angle: element.angle,
    scale: element.scale,
    position: element.position,
    zindex: element.zindex,
    mountType,
  })
  console.log('>>> [now] state visual:', { position, angle, scale, zindex })

  const pickElement = () => {
    const root = rootRef.current
    if (!root) return
    eventEmitter.emit(EInternalEvents.PICK_ELEMENT, id, root, 'sticker')
    selectElement(id, root, 'sticker', path)
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
    elementContainer: HTMLElement,
    printAreaContainer: HTMLElement
  ) => {
    console.log('>>> [now] quay ve 1:', element)
    const elementContainerRect = elementContainer.getBoundingClientRect()
    const rootRect = root.getBoundingClientRect()
    const printAreaContainerRect = printAreaContainer.getBoundingClientRect()
    handleSetElementState(
      elementContainerRect.left +
        (elementContainerRect.width - rootRect.width) / 2 -
        printAreaContainerRect.left,
      elementContainerRect.top +
        (elementContainerRect.height - rootRect.height) / 2 -
        printAreaContainerRect.top
    )
    captureCurrentElementPosition(root, printAreaContainer)
  }

  const initElementDisplaySize = (
    root: HTMLElement,
    elementContainer: HTMLElement,
    moveToCenter?: boolean
  ) => {
    console.log('>>> [now] quay ve 2:', element)
    const display = root.querySelector<HTMLImageElement>('.NAME-element-display')
    if (!display) return
    getNaturalSizeOfImage(
      path,
      (naturalWidth, naturalHeight) => {
        let cssText = `
          height: ${75}px;
          aspect-ratio: ${naturalWidth} / ${naturalHeight};
        `
        display.style.cssText = cssText
        display.onload = () => {
          if (moveToCenter) {
            if (printAreaContainerRef.current) {
              moveElementIntoCenter(root, elementContainer, printAreaContainerRef.current)
            }
          }
          // reset max size limit after image load
          const elementContainerRect = elementContainer.getBoundingClientRect()
          const mainBox = root.querySelector<HTMLElement>('.NAME-element-main-box')
          if (!mainBox) return
          mainBox.style.cssText = `max-width: ${elementContainerRect.width - 16}px; max-height: ${
            elementContainerRect.height - 16
          }px;`
        }
        display.src = path
      },
      (error) => {}
    )
  }

  const initElement = () => {
    requestAnimationFrame(() => {
      const root = rootRef.current
      if (!root) return
      const elementContainer = elementContainerRef.current
      if (!elementContainer) return
      const printAreaContainer = printAreaContainerRef.current
      if (!printAreaContainer) return
      if (mountType === 'from-new') {
        initElementDisplaySize(root, elementContainer, true)
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
  }, [scale, angle, position, isSelected, id])

  useEffect(() => {
    initElement()
    handleAddElementLayer()
  }, [])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.SUBMIT_STICKER_ELE_PROPS, listenSubmitEleProps)
    return () => {
      eventEmitter.off(EInternalEvents.SUBMIT_STICKER_ELE_PROPS, listenSubmitEleProps)
    }
  }, [id])

  return (
    <div
      ref={(node) => {
        refForDrag.current = node
        rootRef.current = node
        refForRotate.current = node
        refForZoom.current = node
        refForPinch.current = node
      }}
      style={{
        left: position.x,
        top: position.y,
        transform: `scale(${scale}) rotate(${angle}deg)`,
        zIndex: zindex,
        ...(mountType === 'from-new'
          ? { height: '75px' }
          : {
              height: `${height}px`,
              width: `${width}px`,
            }),
      }}
      className={`${
        isSelected ? 'shadow-[0_0_0_2px_#f54900]' : ''
      } NAME-root-element NAME-element-type-sticker absolute h-fit w-fit touch-none z-6`}
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
        <div
          className={`${
            isSelected ? 'block' : 'hidden'
          } NAME-rotate-box absolute -top-7 -left-7 z-999 md:-top-9 md:-left-9`}
        >
          <button
            ref={rotateButtonRef}
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
              className="lucide lucide-rotate-cw-icon lucide-rotate-cw h-[18px] w-[18px] md:w-[22px] md:h-[22px]"
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
        </div>
        <div
          className={`${
            isSelected ? 'block' : 'hidden'
          } NAME-remove-box absolute -bottom-7 -right-7 z-999 md:-bottom-9 md:-right-9`}
        >
          <button
            ref={zoomButtonRef}
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
              className="lucide lucide-scaling-icon lucide-scaling h-[18px] w-[18px] md:w-[22px] md:h-[22px]"
            >
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M14 15H9v-5" />
              <path d="M16 3h5v5" />
              <path d="M21 3 9 15" />
            </svg>
          </button>
        </div>
        <div
          className={`${
            isSelected ? 'block' : 'hidden'
          } NAME-remove-box absolute -top-7 -right-7 z-999 md:-top-9 md:-right-9`}
        >
          <button
            onClick={removeElement}
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
              className="lucide lucide-x-icon lucide-x h-[18px] w-[18px] md:w-[22px] md:h-[22px]"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
