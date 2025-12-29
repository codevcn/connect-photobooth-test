import { createInitialConstants } from '@/utils/contants'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { TElementType, TPrintedImageVisualState } from '@/utils/types/global'
import { useEffect, useRef, useState } from 'react'
import { CropImageElement } from '../CropImageElement'
import { useQueryFilter } from '@/hooks/extensions'

type TGrayscaleControlProps = {
  grayscale: number
  pickedElementRootRef?: React.RefObject<HTMLElement | null>
  setGrayscale: (value: number) => void
}

const GrayscaleControl = ({
  grayscale,
  setGrayscale,
  pickedElementRootRef,
}: TGrayscaleControlProps) => {
  const [showPopover, setShowPopover] = useState(false)

  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const detectCollision = () => {
    const popover = popoverRef.current
    if (!popover) return
    const rect = popover.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const margin = 10

    // Phát hiện va chạm với cạnh trên
    if (rect.top < margin) {
      popover.style.top = `calc(100% + ${Math.abs(rect.top) + margin}px)`
    }

    // Phát hiện va chạm với cạnh dưới
    if (rect.bottom > viewportHeight - margin) {
      popover.style.top = `calc(-100% + ${Math.abs(rect.bottom) + margin}px)`
    }

    // Phát hiện va chạm với cạnh trái
    if (rect.left < margin) {
      popover.style.right = `-${Math.abs(rect.left) + margin}px`
    }

    // Phát hiện va chạm với cạnh phải
    if (rect.right > viewportWidth - margin) {
      popover.style.right = `${Math.abs(rect.right) + margin}px`
    }
  }

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowPopover(false)
      }
    }

    if (showPopover) {
      detectCollision()
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPopover])

  const handleGrayscaleChange = (value: number) => {
    setGrayscale(value)
    const root = pickedElementRootRef?.current
    root
      ?.querySelector<HTMLElement>('.NAME-element-display-wrapper')
      ?.style.setProperty('filter', `grayscale(${value}%)`)
    root?.setAttribute(
      'data-visual-state',
      JSON.stringify({
        ...(JSON.parse(
          root?.getAttribute('data-visual-state') || '{}'
        ) as TPrintedImageVisualState),
        grayscale: value,
      })
    )
  }

  return (
    <div className="relative w-full h-full">
      <button
        ref={buttonRef}
        onClick={() => setShowPopover(!showPopover)}
        className="group flex items-center justify-center font-bold gap-1 text-inherit rounded py-1 px-0.5 w-full h-full"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 smd:w-5 smd:h-5 5xl:w-7 5xl:h-7"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2v20" />
        </svg>
        <span className="5xl:text-[1em] text-xs smd:text-sm">Trắng đen</span>
      </button>

      {showPopover && (
        <div
          ref={popoverRef}
          className="5xl:text-2xl min-w-[280px] translate-x-5 max-w-[480px] absolute -right-1 top-[calc(100%+4px)] bg-white border-2 border-main-cl rounded-lg shadow-xl p-3 z-999"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-row items-center gap-3">
            <span className="text-[1em] font-semibold text-main-cl whitespace-nowrap">0%</span>

            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={grayscale}
                onChange={(e) => handleGrayscaleChange(Number(e.target.value))}
                className="w-full cursor-pointer accent-main-cl"
                style={{
                  height: '8px',
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${grayscale}%, #e5e7eb ${grayscale}%, #e5e7eb 100%)`,
                  borderRadius: '4px',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                }}
              />
            </div>

            <span className="text-[1em] font-semibold text-main-cl whitespace-nowrap">100%</span>
          </div>
        </div>
      )}
    </div>
  )
}

type TPropertyType = 'scale' | 'angle' | 'posXY' | 'zindex-up' | 'zindex-down'

type TPrintedImageElementMenu = {
  elementId: string
  onClose: () => void
}

export const PrintedImageElementMenu = ({ elementId, onClose }: TPrintedImageElementMenu) => {
  const queryFilter = useQueryFilter()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [grayscale, setGrayscale] = useState<number>(0)

  const getPickedElementRoot = () => {
    return document.body.querySelector<HTMLElement>(
      '.NAME-print-area-container .NAME-root-element[data-root-element-id="' + elementId + '"]'
    )
  }
  const pickedElementRootRef = useRef<HTMLElement>(getPickedElementRoot())

  useEffect(() => {
    pickedElementRootRef.current = getPickedElementRoot()
  }, [elementId])

  const validateInputsPositiveNumber = (
    inputs: HTMLInputElement[],
    type: TPropertyType
  ): (number | undefined)[] => {
    const values = inputs.map((input) => input.value.trim())
    // Allow negative numbers if type is 'angle'
    const numberRegex = type === 'angle' ? /^-?\d*\.?\d+$|^0$/ : /^\d+(\.\d+)?$/
    const validValues = values.map((value) =>
      numberRegex.test(value) ? parseFloat(value) : undefined
    )
    return validValues.length > 0 ? validValues : []
  }

  const handleChangeProperties = (
    scale?: number,
    angle?: number,
    posX?: number,
    posY?: number,
    zIndex?: number
  ) => {
    eventEmitter.emit(
      EInternalEvents.SUBMIT_PRINTED_IMAGE_ELE_PROPS,
      elementId,
      scale,
      angle,
      posX,
      posY,
      zIndex
    )
  }

  const submit = (inputs: HTMLInputElement[], type: TPropertyType) => {
    const values = validateInputsPositiveNumber(inputs, type)
    if (values && values.length > 0) {
      switch (type) {
        case 'scale':
          handleChangeProperties(values[0] ? values[0] / 100 : undefined)
          break
        case 'angle':
          handleChangeProperties(undefined, values[0])
          break
        case 'posXY':
          if (values.length >= 2) {
            handleChangeProperties(undefined, undefined, values[0], values[1])
          }
      }
    }
  }

  const catchEnter = (e: React.KeyboardEvent<HTMLInputElement>, type: TPropertyType) => {
    if (e.key === 'Enter') {
      const formGroup = e.currentTarget.closest<HTMLElement>('.NAME-form-group')
      const inputs = formGroup?.querySelectorAll<HTMLInputElement>('input')
      if (inputs) {
        submit(Array.from(inputs), type)
      }
    }
  }

  const getAllInputsInForm = () => {
    const menuSection = menuRef.current
    const scaleInput = menuSection?.querySelector<HTMLInputElement>('.NAME-form-scale input')
    const angleInput = menuSection?.querySelector<HTMLInputElement>('.NAME-form-angle input')
    const posXYInputs = menuSection?.querySelectorAll<HTMLInputElement>('.NAME-form-position input')
    return { scaleInput, angleInput, posXYInputs }
  }

  const handleClickCheck = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { scaleInput, angleInput, posXYInputs } = getAllInputsInForm()
    handleChangeProperties(
      scaleInput?.value ? parseFloat(scaleInput.value) / 100 : undefined,
      angleInput?.value ? parseFloat(angleInput.value) : undefined,
      posXYInputs && posXYInputs[0]?.value ? parseFloat(posXYInputs[0].value) : undefined,
      posXYInputs && posXYInputs[1]?.value ? parseFloat(posXYInputs[1].value) : undefined
    )
    onClose()
  }

  const listenElementProps = (idOfElement: string | null, type: TElementType) => {
    if (type !== 'printed-image' || elementId !== idOfElement) return
    const pickedElementRoot = pickedElementRootRef.current
    const dataset = JSON.parse(pickedElementRoot?.getAttribute('data-visual-state') || '{}')
    const { scale, angle, position, grayscale } = dataset as TPrintedImageVisualState
    const { x: posX, y: posY } = position || {}
    const menuSection = menuRef.current
    if (scale) {
      const scaleInput = menuSection?.querySelector<HTMLInputElement>('.NAME-form-scale input')
      if (scaleInput) scaleInput.value = (scale * 100).toFixed(0)
    }
    if (angle || angle === 0) {
      const angleInput = menuSection?.querySelector<HTMLInputElement>('.NAME-form-angle input')
      if (angleInput) angleInput.value = angle.toFixed(0)
    }
    if (posX || posX === 0) {
      const posXYInputs = menuSection?.querySelectorAll<HTMLInputElement>(
        '.NAME-form-position input'
      )
      if (posXYInputs && posXYInputs.length > 0) posXYInputs[0].value = posX.toFixed(0)
    }
    if (posY || posY === 0) {
      const posXYInputs = menuSection?.querySelectorAll<HTMLInputElement>(
        '.NAME-form-position input'
      )
      if (posXYInputs && posXYInputs.length > 0) posXYInputs[1].value = posY.toFixed(0)
    }
    if (grayscale || grayscale === 0) {
      setGrayscale(grayscale)
    }
  }

  const onClickButton = (type: TPropertyType) => {
    if (type === 'zindex-down') {
      handleChangeProperties(
        undefined,
        undefined,
        undefined,
        undefined,
        -createInitialConstants<number>('ELEMENT_ZINDEX_STEP')
      )
    } else if (type === 'zindex-up') {
      handleChangeProperties(
        undefined,
        undefined,
        undefined,
        undefined,
        createInitialConstants<number>('ELEMENT_ZINDEX_STEP')
      )
    }
  }

  useEffect(() => {
    listenElementProps(elementId, 'printed-image')
  }, [elementId])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    return () => {
      eventEmitter.off(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    }
  }, [])

  return (
    <div className="NAME-menu-section NAME-menu-printed-image-element STYLE-hide-scrollbar 5xl:text-[1.3em] smd:text-base smd:px-0 smd:mt-2 px-2 text-sm w-full">
      <h3 className="5xl:text-[1em] text-xs smd:text-sm smd:mt-3 mb-1 font-bold">
        Tùy chỉnh ảnh photobooth
      </h3>
      <div
        ref={menuRef}
        className="smd:grid-cols-2 smd:grid-flow-row 2xl:grid-cols-3 smd:gap-2 grid-cols-3 gap-1 grid rounded-md text-white"
      >
        <div className="NAME-form-group NAME-form-angle 5xl:h-14 h-8 smd:h-9 flex items-center bg-main-cl rounded px-1 shadow">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-refresh-ccw-icon lucide-refresh-ccw w-4 h-4 smd:w-5 smd:h-5 5xl:w-6 5xl:h-6"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
          </div>
          <div className="flex gap-1 items-center mx-1 grow">
            <input
              type="text"
              placeholder="Độ xoay, VD: 22"
              onKeyDown={(e) => catchEnter(e, 'angle')}
              className="text-black bg-white rounded px-1 py-0.5 text-[1em] outline-none w-full 5xl:text-[1.3em]"
            />
            <span className="text-white text-[1em] font-bold">độ</span>
          </div>
        </div>
        <div className="NAME-form-group NAME-form-grayscale 5xl:h-12 h-8 smd:h-9 cursor-pointer border-2 border-main-cl text-white hover:bg-white hover:text-main-cl flex items-center justify-center bg-main-cl rounded shadow">
          <GrayscaleControl
            grayscale={grayscale}
            setGrayscale={setGrayscale}
            pickedElementRootRef={pickedElementRootRef}
          />
        </div>
        <div className="NAME-form-group NAME-form-zindex 5xl:h-14 h-8 smd:h-9 flex items-center justify-between bg-main-cl rounded px-1 shadow">
          <div className="mr-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-layers2-icon lucide-layers-2 w-4 h-4 smd:w-5 smd:h-5 5xl:w-6 5xl:h-6"
            >
              <path d="M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z" />
              <path d="m20 14.285 1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845" />
            </svg>
          </div>
          <div className="flex grow">
            <button
              onClick={() => onClickButton('zindex-up')}
              className="bg-white border-2 grow text-main-cl border-main-cl rounded px-1.5 flex items-center justify-center mobile-touch"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-up-icon lucide-arrow-up w-5 h-5 5xl:w-9 5xl:h-9"
              >
                <path d="m5 12 7-7 7 7" />
                <path d="M12 19V5" />
              </svg>
            </button>
            <button
              onClick={() => onClickButton('zindex-down')}
              className="bg-white border-2 grow text-main-cl border-main-cl rounded px-1.5 py-0.5 flex items-center justify-center mobile-touch"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-down-icon lucide-arrow-down w-5 h-5 5xl:w-9 5xl:h-9"
              >
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {queryFilter.isPhotoism && <CropImageElement />}

        <div
          className={`${
            queryFilter.isPhotoism ? 'col-span-1' : 'col-span-3'
          } 5xl:h-14 smd:col-span-1 smd:h-full 2xl:h-8 2xl:col-span-3 h-8 flex items-center`}
        >
          <button
            onClick={handleClickCheck}
            className="smd:h-full smd:px-1 2xl:h-full group h-full px-3 w-full cursor-pointer flex flex-nowrap items-center justify-center font-bold bg-main-cl gap-1 text-white mobile-touch rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-check-icon lucide-check 5xl:w-8 5xl:h-8"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
