import { useEditedElementStore } from '@/stores/element/element.store'
import { createInitialConstants } from '@/utils/contants'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { TElementType, TStickerVisualState } from '@/utils/types/global'
import { useEffect, useRef } from 'react'

type TPropertyType = 'scale' | 'angle' | 'posXY' | 'zindex-up' | 'zindex-down'

type TStickerElementMenu = {
  elementId: string
  onClose: () => void
}

export const StickerElementMenu = ({ elementId, onClose }: TStickerElementMenu) => {
  const menuRef = useRef<HTMLDivElement | null>(null)
  const selectedElement = useEditedElementStore((s) => s.selectedElement)
  const pickedElementRoot = selectedElement?.rootElement || null

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
      EInternalEvents.SUBMIT_STICKER_ELE_PROPS,
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
    if (type !== 'sticker' || elementId !== idOfElement) return
    const dataset = JSON.parse(pickedElementRoot?.getAttribute('data-visual-state') || '{}')
    const { scale, angle, position } = dataset as TStickerVisualState
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
      if (posXYInputs) posXYInputs[0].value = posX.toFixed(0)
    }
    if (posY || posY === 0) {
      const posXYInputs = menuSection?.querySelectorAll<HTMLInputElement>(
        '.NAME-form-position input'
      )
      if (posXYInputs) posXYInputs[1].value = posY.toFixed(0)
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
    listenElementProps(elementId, 'sticker')
  }, [elementId])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    return () => {
      eventEmitter.off(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    }
  }, [])

  return (
    <div className="NAME-menu-section NAME-menu-sticker-element STYLE-hide-scrollbar smd:text-base text-sm w-full mt-2">
      <h3 className="text-xs smd:text-sm mt-3 mb-1 font-bold">Tùy chỉnh</h3>
      <div
        ref={menuRef}
        className="smd:grid-cols-2 2xl:grid-cols-3 smd:gap-2 smd:grid-rows-1 smd:grid-flow-row grid-flow-col grid-rows-2 gap-1 grid rounded-md text-white"
      >
        <div className="NAME-form-group NAME-form-scale h-8 smd:h-9 flex items-center bg-main-cl rounded px-1 shadow">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-maximize-icon lucide-maximize text-white w-4 h-4 smd:w-5 smd:h-5"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" />
              <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          </div>
          <div className="flex gap-1 items-center mx-1 grow">
            <input
              type="text"
              placeholder="Độ co giãn, VD: 55"
              onKeyDown={(e) => catchEnter(e, 'scale')}
              className="text-black bg-white rounded px-1 py-0.5 text-[1em] outline-none w-full"
            />
            <span className="text-white text-[1em] font-bold">%</span>
          </div>
        </div>
        <div className="NAME-form-group NAME-form-angle h-8 smd:h-9 flex items-center bg-main-cl rounded px-1 shadow">
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
              className="lucide lucide-refresh-ccw-icon lucide-refresh-ccw w-4 h-4 smd:w-5 smd:h-5"
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
              className="text-black bg-white rounded px-1 py-0.5 text-[1em] outline-none w-full"
            />
            <span className="text-white text-[1em] font-bold">độ</span>
          </div>
        </div>
        <div className="NAME-form-group NAME-form-zindex h-8 smd:h-9 flex items-center justify-between bg-main-cl rounded px-1 shadow">
          <div className="mr-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-layers2-icon lucide-layers-2 w-4 h-4 smd:w-5 smd:h-5"
            >
              <path d="M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z" />
              <path d="m20 14.285 1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845" />
            </svg>
          </div>
          <div className="flex grow">
            <button
              onClick={() => onClickButton('zindex-up')}
              className="bg-white border-2 grow text-main-cl border-main-cl rounded px-1.5 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-up-icon lucide-arrow-up w-5 h-5"
              >
                <path d="m5 12 7-7 7 7" />
                <path d="M12 19V5" />
              </svg>
            </button>
            <button
              onClick={() => onClickButton('zindex-down')}
              className="bg-white border-2 grow text-main-cl border-main-cl rounded px-1.5 py-0.5 flex items-center justify-center"
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
                className="lucide lucide-arrow-down-icon lucide-arrow-down w-5 h-5"
              >
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="NAME-form-group NAME-form-position 2xl:col-span-2 flex items-center bg-main-cl rounded px-1 py-1 shadow">
          <div>
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
              className="lucide lucide-move-icon lucide-move w-4 h-4 smd:w-5 smd:h-5"
            >
              <path d="M12 2v20" />
              <path d="m15 19-3 3-3-3" />
              <path d="m19 9 3 3-3 3" />
              <path d="M2 12h20" />
              <path d="m5 9-3 3 3 3" />
              <path d="m9 5 3-3 3 3" />
            </svg>
          </div>
          <div className="flex gap-1 mx-1">
            <input
              type="text"
              placeholder="Tọa độ X, VD: 100"
              onKeyDown={(e) => catchEnter(e, 'posXY')}
              className="smd:h-6.5 h-6 text-black bg-white rounded px-1 text-[1em] outline-none w-full"
            />
            <input
              type="text"
              placeholder="Tọa độ Y, VD: 100"
              onKeyDown={(e) => catchEnter(e, 'posXY')}
              className="smd:h-6.5 h-6 text-black bg-white rounded px-1 text-[1em] outline-none w-full"
            />
          </div>
        </div>
        <div className="smd:row-span-1 smd:col-span-2 2xl:col-span-1 row-span-2 flex items-center">
          <button
            onClick={handleClickCheck}
            className="group smd:h-8 smd:px-1 h-full px-3 w-full cursor-pointer flex flex-nowrap items-center justify-center shadow-md font-bold bg-main-cl gap-1 text-white mobile-touch rounded"
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
              className="lucide lucide-check-icon lucide-check"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
