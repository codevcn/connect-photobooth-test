import { EInternalEvents, eventEmitter } from '@/utils/events'
import { TElementType, TTextVisualState } from '@/utils/types/global'
import { useEffect, useRef, useState } from 'react'
import { ColorPickerModal, initColorOnShow } from './ColorPicker'
import { TextFontPicker } from './FontPicker'
import { createInitialConstants } from '@/utils/contants'
import { createPortal } from 'react-dom'
import { detectColorFormat, getContrastColor, rgbStringToHex } from '@/utils/helpers'
import { ETextFieldNameForKeyBoard } from '@/providers/GlobalKeyboardProvider'
import { useEditedElementStore } from '@/stores/element/element.store'

type TPropertyType = 'font-size' | 'angle' | 'posXY' | 'zindex-up' | 'zindex-down'

type TPrintedImageMenuProps = {
  elementId: string
  onClose: () => void
}

export const TextElementMenu = ({ elementId, onClose }: TPrintedImageMenuProps) => {
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false)
  const [showTextFontPicker, setShowTextFontPicker] = useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [inputText, setInputText] = useState<string>()
  const getPickedElementRoot = () => {
    return document.body.querySelector<HTMLElement>(
      '.NAME-print-area-container .NAME-root-element[data-root-element-id="' + elementId + '"]'
    )
  }
  const pickedElementRootRef = useRef<HTMLElement>(getPickedElementRoot())
  const [currentColor, setCurrentColor] = useState<string>('#000')

  useEffect(() => {
    pickedElementRootRef.current = getPickedElementRoot()
  }, [elementId])

  const validateInputsPositiveNumber = (
    inputs: (HTMLInputElement | HTMLTextAreaElement)[],
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
    fontSize?: number,
    angle?: number,
    posX?: number,
    posY?: number,
    zindex?: number,
    color?: string,
    content?: string,
    fontFamily?: string
  ) => {
    eventEmitter.emit(
      EInternalEvents.SUBMIT_TEXT_ELE_PROPS,
      elementId,
      fontSize,
      angle,
      posX,
      posY,
      zindex,
      color,
      content,
      fontFamily
    )
  }

  const submit = (inputs: (HTMLInputElement | HTMLTextAreaElement)[], type: TPropertyType) => {
    const values = validateInputsPositiveNumber(inputs, type)
    if (values && values.length > 0) {
      switch (type) {
        case 'font-size':
          handleChangeProperties(values[0])
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

  const catchEnter = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    type: TPropertyType
  ) => {
    if (e.key === 'Enter') {
      const formGroup = e.currentTarget.closest<HTMLElement>('.NAME-form-group')
      const inputs = formGroup?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        'input,textarea'
      )
      if (inputs) {
        submit(Array.from(inputs), type)
      }
    }
  }

  const handleClickCheck = (e: React.MouseEvent<HTMLButtonElement>) => {
    const menuSection = e.currentTarget.closest<HTMLElement>('.NAME-menu-section')
    const scaleInput = menuSection?.querySelector<HTMLInputElement>('.NAME-form-fontSize input')
    const angleInput = menuSection?.querySelector<HTMLInputElement>('.NAME-form-angle input')
    const posXYInputs = menuSection?.querySelectorAll<HTMLInputElement>('.NAME-form-position input')
    handleChangeProperties(
      scaleInput?.value ? parseFloat(scaleInput.value) : undefined,
      angleInput?.value ? parseFloat(angleInput.value) : undefined,
      posXYInputs && posXYInputs[0]?.value ? parseFloat(posXYInputs[0].value) : undefined,
      posXYInputs && posXYInputs[1]?.value ? parseFloat(posXYInputs[1].value) : undefined
    )
    // onClose()
  }

  const handleAdjustColorOnElement = (color: string) => {
    if (color) {
      handleChangeProperties(undefined, undefined, undefined, undefined, undefined, color)
    }
  }

  const initInputText = () => {
    const pickedElementRoot = pickedElementRootRef.current
    const textElement = pickedElementRoot?.querySelector<HTMLElement>(
      '.NAME-displayed-text-content'
    )
    if (textElement) {
      setInputText(textElement.textContent)
    }
  }

  const onContentFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChangeProperties(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      e.target.value || undefined
    )
  }

  const handleSelectFont = (fontFamily: string) => {
    handleChangeProperties(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      fontFamily
    )
  }

  const listenElementProps = (idOfElement: string | null, type: TElementType) => {
    if (type !== 'text' || elementId !== idOfElement) return
    const pickedElementRoot = pickedElementRootRef.current
    const dataset = JSON.parse(pickedElementRoot?.getAttribute('data-visual-state') || '{}')
    const { fontSize, angle, position } = dataset as TTextVisualState
    const { x: posX, y: posY } = position || {}
    const menuSection = menuRef.current
    if (fontSize) {
      const fontSizeInput = menuSection?.querySelector<HTMLInputElement>(
        '.NAME-form-fontSize input'
      )
      if (fontSizeInput) fontSizeInput.value = fontSize.toFixed(0)
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
  }

  const updateContentInputOnInputTextChange = () => {
    const textElement = pickedElementRootRef.current?.querySelector<HTMLElement>(
      '.NAME-displayed-text-content'
    )
    if (textElement) {
      const contentInput = menuRef.current?.querySelector<HTMLInputElement>(
        '.NAME-form-content input'
      )
      if (contentInput) {
        contentInput.value = textElement.textContent
      }
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
    updateContentInputOnInputTextChange()
  }, [inputText])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    initInputText()
    listenElementProps(elementId, 'text')
    return () => {
      eventEmitter.off(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    }
  }, [elementId])

  useEffect(() => {
    initColorOnShow(setCurrentColor)
  }, [])

  return (
    <div
      ref={menuRef}
      className="NAME-menu-section NAME-menu-text-element STYLE-hide-scrollbar 5xl:text-[1.3em] smd:text-base smd:px-0 smd:mt-2 px-2 text-sm w-full"
    >
      <h3 className="5xl:text-[1em] text-xs smd:text-sm smd:mt-3 mb-1 font-bold">
        Tùy chỉnh văn bản
      </h3>
      <div ref={menuRef} className="spmd:gap-2 grid-cols-3 gap-1 grid rounded-md text-white">
        <div className="NAME-form-group NAME-form-content 5xl:h-14 h-8 smd:h-9 col-span-3 flex items-center bg-main-cl rounded px-1 shadow">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-pen-icon lucide-pen w-4 h-4 smd:w-5 smd:h-5 5xl:w-6 5xl:h-6"
            >
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
            </svg>
          </div>
          <div className="flex gap-1 ml-1 grow">
            <input
              className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} 5xl:text-[1.3em] text-black bg-white rounded px-1 py-0.5 text-[1em] outline-none w-full`}
              placeholder="Nhập nội dung..."
              onKeyDown={(e) => catchEnter(e, 'font-size')}
              onChange={onContentFieldChange}
            />
          </div>
        </div>
        {/* <div className="NAME-form-group NAME-form-fontSize h-8 smd:h-9 flex items-center bg-main-cl rounded px-1 shadow">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-alarge-small-icon lucide-a-large-small w-4 h-4 smd:w-5 smd:h-5"
            >
              <path d="m15 16 2.536-7.328a1.02 1.02 1 0 1 1.928 0L22 16" />
              <path d="M15.697 14h5.606" />
              <path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16" />
              <path d="M3.304 13h6.392" />
            </svg>
          </div>
          <div className="flex gap-1 ml-1 grow">
            <input
              className="text-black bg-white rounded px-1 py-0.5 text-[1em] outline-none w-full"
              type="text"
              placeholder="Cỡ chữ, VD: 18"
              onKeyDown={(e) => catchEnter(e, 'font-size')}
            />
          </div>
        </div> */}
        <div className="NAME-form-group NAME-form-angle 5xl:h-14 h-8 smd:h-9 flex items-center bg-main-cl rounded px-1 shadow">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-refresh-cw-icon lucide-refresh-cw w-4 h-4 smd:w-5 smd:h-5 5xl:w-6 5xl:h-6"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </div>
          <div className="flex gap-1 items-center ml-1 grow">
            <input
              className="text-black bg-white rounded px-1 py-0.5 text-[1em] outline-none w-full 5xl:text-[1.3em]"
              type="text"
              placeholder="Độ xoay, VD: 22"
              onKeyDown={(e) => catchEnter(e, 'angle')}
            />
            <span className="text-white text-[1em] font-bold">độ</span>
          </div>
        </div>
        {/* <div className="NAME-form-group NAME-form-position h-8 smd:h-9 flex items-center bg-main-cl rounded px-1 shadow">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
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
          <div className="flex ml-1 gap-1">
            <input
              className="text-black bg-white rounded px-1 py-0.5 text-[1em] outline-none w-full"
              type="text"
              placeholder="X, VD: 100"
              onKeyDown={(e) => catchEnter(e, 'posXY')}
            />
            <input
              className="text-black bg-white rounded px-1 py-0.5 text-[1em] outline-none w-full"
              type="text"
              placeholder="Y, VD: 100"
              onKeyDown={(e) => catchEnter(e, 'posXY')}
            />
          </div>
        </div> */}
        <div className="NAME-form-group NAME-form-zindex 5xl:h-14 h-8 smd:h-9 col-span-2 flex items-center justify-between bg-main-cl rounded px-1 shadow">
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
          <div className="flex grow flex-wrap">
            <button
              onClick={() => onClickButton('zindex-up')}
              className="bg-white border-2 grow text-main-cl border-main-cl rounded px-1.5 py-0.5 flex gap-0.5 items-center justify-center mobile-touch"
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
              className="bg-white border-2 grow text-main-cl border-main-cl rounded px-1.5 py-0.5 flex gap-0.5 items-center justify-center mobile-touch"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
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
        <div className="NAME-form-group NAME-form-color 5xl:h-14 flex items-stretch justify-center gap-1 rounded">
          <div
            onClick={() => setShowColorPicker((pre) => !pre)}
            className="flex items-center justify-center cursor-pointer 5xl:h-12 h-8 smd:h-9 w-full gap-1 mobile-touch rounded shadow px-1"
            style={{
              backgroundImage: `linear-gradient(to right, #fff, ${currentColor})`,
            }}
          >
            <div className="flex gap-1 mx-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#fff"
                stroke="#f54900"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-palette-icon lucide-palette text-white 5xl:w-8 5xl:h-8"
              >
                <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
              </svg>
            </div>
          </div>
          {showColorPicker &&
            createPortal(
              <ColorPickerModal
                onHideShow={setShowColorPicker}
                onColorChange={handleAdjustColorOnElement}
                inputText={inputText || ''}
                currentColor={currentColor}
                setCurrentColor={setCurrentColor}
              />,
              document.body
            )}
        </div>
        <div className="NAME-form-group NAME-form-font flex items-stretch justify-center gap-1 relative rounded">
          <div
            onClick={() => setShowTextFontPicker((pre) => !pre)}
            className="flex items-center justify-center cursor-pointer 5xl:h-12 gap-1 h-full sm:h-8 smd:h-9 w-full mobile-touch bg-main-cl rounded shadow px-1"
          >
            <div className="flex gap-1 mx-1">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-type-outline-icon lucide-type-outline 5xl:w-8 5xl:h-8"
                >
                  <path d="M14 16.5a.5.5 0 0 0 .5.5h.5a2 2 0 0 1 0 4H9a2 2 0 0 1 0-4h.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V8a2 2 0 0 1-4 0V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-4 0v-.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5Z" />
                </svg>
              </div>
            </div>
          </div>
          {showTextFontPicker &&
            createPortal(
              <TextFontPicker onHideShow={setShowTextFontPicker} onSelectFont={handleSelectFont} />,
              document.body
            )}
        </div>
        <div className="5xl:h-12 flex items-center">
          <button
            onClick={handleClickCheck}
            className="5xl:h-12 group 2xl:h-9 smd:px-1 px-3 w-full h-full cursor-pointer flex flex-nowrap items-center justify-center shadow-md font-bold bg-main-cl text-white mobile-touch rounded"
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
