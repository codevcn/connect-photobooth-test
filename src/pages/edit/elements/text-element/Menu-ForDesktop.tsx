import { EInternalEvents, eventEmitter } from '@/utils/events'
import { TElementType, TTextVisualState } from '@/utils/types/global'
import { useEffect, useRef, useState, useCallback } from 'react'
import { ColorPickerModal, initColorOnShow } from './ColorPicker'
import { TextFontPicker } from './FontPicker'
import { createInitialConstants } from '@/utils/contants'
import { createPortal } from 'react-dom'
import { ETextFieldNameForKeyBoard } from '@/providers/GlobalKeyboardProvider'
import { CropImageElement } from '../CropImageElement'

type TPropertyType = 'font-size' | 'angle' | 'posXY' | 'zindex-up' | 'zindex-down'

type TPrintedImageMenuProps = {
  elementId: string
  onClose: () => void
}

export const TextElementMenuForDesktop = ({ elementId, onClose }: TPrintedImageMenuProps) => {
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false)
  const [showTextFontPicker, setShowTextFontPicker] = useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const [inputText, setInputText] = useState<string>()
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number
    left: number
    isVisible: boolean
  }>({ top: 0, left: 0, isVisible: false })
  const [isDragging, setIsDragging] = useState(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
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

  // Calculate popover position based on element position
  const calculatePopoverPosition = () => {
    const printAreaContainer = document.body.querySelector<HTMLElement>(
      '.NAME-print-area-container-wrapper'
    )
    if (!printAreaContainer) return
    const menu = menuRef.current
    if (!menu) return
    const menuRect = menu.getBoundingClientRect()
    const printAreaContainerRect = printAreaContainer.getBoundingClientRect()
    let top = (printAreaContainerRect.height - menuRect.height) / 2
    let left = printAreaContainerRect.right - menuRect.width - 10

    setPopoverPosition({ top, left, isVisible: true })
  }

  // Drag handlers - sử dụng useCallback để tránh stale closure
  const handleDragMove = useCallback((e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPopoverPosition((prev) => ({
      ...prev,
      left: e.clientX - dragOffsetRef.current.x,
      top: e.clientY - dragOffsetRef.current.y,
    }))
  }, [])

  const handleDragEnd = useCallback((e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Capture pointer để đảm bảo events tiếp tục được gửi đến element này
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    dragOffsetRef.current = {
      x: e.clientX - popoverPosition.left,
      y: e.clientY - popoverPosition.top,
    }
  }

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
    // Calculate position after render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        calculatePopoverPosition()
      })
    })

    // Recalculate on window resize
    window.addEventListener('resize', calculatePopoverPosition)
    return () => {
      window.removeEventListener('resize', calculatePopoverPosition)
    }
  }, [elementId])

  // Drag effect
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handleDragMove)
      window.addEventListener('pointerup', handleDragEnd)
      window.addEventListener('pointercancel', handleDragEnd)
    } else {
      window.removeEventListener('pointermove', handleDragMove)
      window.removeEventListener('pointerup', handleDragEnd)
      window.removeEventListener('pointercancel', handleDragEnd)
    }

    return () => {
      window.removeEventListener('pointermove', handleDragMove)
      window.removeEventListener('pointerup', handleDragEnd)
      window.removeEventListener('pointercancel', handleDragEnd)
    }
  }, [isDragging, handleDragMove, handleDragEnd])

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

  return createPortal(
    <div
      ref={popoverRef}
      className="NAME-menu-section NAME-menu-text-element STYLE-hide-scrollbar smd:block hidden fixed z-100 bg-white border-2 border-main-cl rounded-lg shadow-xl"
      style={{
        top: `${popoverPosition.top}px`,
        left: `${popoverPosition.left}px`,
        opacity: popoverPosition.isVisible ? 1 : 0,
        pointerEvents: popoverPosition.isVisible ? 'auto' : 'none',
        transition: 'opacity 0.15s ease-in-out',
        maxWidth: '320px',
        width: 'max-content',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drag Handle */}
      <div
        onPointerDown={handleDragStart}
        className="5xl:py-2.5 select-none touch-none flex items-center justify-center py-1.5 cursor-move bg-gray-100 rounded-t-lg border-b border-gray-200 hover:bg-gray-200 transition"
      >
        <div className="flex flex-col gap-0.5">
          <div className="5xl:h-1.5 w-8 h-0.5 bg-gray-400 rounded"></div>
          <div className="5xl:h-1.5 w-8 h-0.5 bg-gray-400 rounded"></div>
        </div>
      </div>

      <div className="5xl:text-2xl p-2">
        <h3 className="text-[1em] font-bold text-main-cl mb-4 text-center">Tùy chỉnh</h3>
        <div ref={menuRef} className="flex flex-col gap-2 text-white">
          <div className="NAME-form-group NAME-form-content py-1 flex items-center bg-main-cl rounded px-1 shadow">
            <div className="p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-pen-icon lucide-pen w-5 h-5 5xl:w-7 5xl:h-7"
              >
                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
              </svg>
            </div>
            <div className="flex gap-1 ml-1 grow">
              <input
                className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} 5xl:text-[1em] text-black bg-white rounded px-1 py-0.5 text-sm outline-none w-full`}
                placeholder="Nhập nội dung..."
                onKeyDown={(e) => catchEnter(e, 'font-size')}
                onChange={onContentFieldChange}
              />
            </div>
          </div>
          <div className="NAME-form-group NAME-form-zindex flex flex-col gap-1 items-start">
            <button
              onClick={() => onClickButton('zindex-up')}
              className="grow text-black rounded flex gap-1 items-center mobile-touch py-0.5 justify-start hover:bg-gray-100 w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.2"
                viewBox="0 0 159 155"
                className="rotate-180 w-7 h-7 5xl:w-12 5xl:h-12"
              >
                <defs>
                  <image
                    width="97"
                    height="98"
                    id="img1"
                    href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGEAAABiCAYAAABAkr0NAAAAAXNSR0IB2cksfwAAJYtJREFUeJztnWeYVeW1x48FBhjK0IcBaVKUXkS9GqMxscRoxJZyb/LEBAto9JrEmxBF6SokJN4kiooooDEmuenBgtFgYjQ2OkiRIp1hOtMYysr7W2f/t/t+iDPPM3NGQD/sZ+9z5swu67/6Wu/aqX1lVakP2spKKz9wq+3/a9uKi4tTJSUlqX379qWqq6t9KysrS5WWlqaqqqpSRVynoiZVWXMotbe4LFVSXpXaunNPzr7KA/63wpKK1IHDltpbFP7/gKVK9lWnDlr6M99XVFuquOz98/B/pRXVqcLS8tTugmL//Qdt9X2+umy1/iDTIFRWVvoG4fPz81OFhYUxGBxX1Vhqx+5CJxzEBYANm7fa5Gkz7H/G32Vf/fp1dunoq+ybt33Hjx+d94T9YeFzBli79hYFEA45CIDCHiCK91X6+fYfso9BYIPYSAFbeXm57/fv3586ePCgf4YQBSXh71U1qWn3/cA+c/HnrF2nLpbdpp2179TVOuWdZG3ad7LU8U3spF59rFXbDtYht6sNHn6a3Tlxir27efttkgKkxgkbzlVUVpHKLyr9GAQ2uL2oqMjBgPioJzYHIKipFavX26Rp91rrdh2d+C1z2juR2bdskyY437do3dY6d+1uTZq39O8AJqdDZ+vd71S74+7JtnTlGoP4NYH7S8v3x5LxMQiRJLBVVFQ4GNgCPi9dutRmzpxpTVu0cqJCUAjbtmOunZDVwjp26WbNWrZxcJCK3G49/Dfdep5szVvl+DG/5X/Znzp4mH3vzrsNUFFxSAZgHBUg1LbBtYcOHUodOHDAVQnGVARFz/MgcJy4b09BqX9GV/PdgaDnd+YXpsoq97vxXb3u3S3jJ0x0IsPdqJzjm7Sw1m07+TEEhtAiPsRGEpACVBHAtO+c58TnMxLDudhzvlMGDrPp982yJcvXGOqpcv/hmOACh/vjmO1A2PZgk8JviwrL/Lgi3Hd5+H15A4FU7xPs2bPHiZ40rPJ20Ot6IB6ObVd+sRvYguJy/x4Ppfqgpdas37gMTu3ao7dlZbe2vO69nJAdOnezdh3zrEmzVtatR58YHAjMhnQAAP/D5y4n9XTO53t+xzEAoKYAJ7t1Wo0NGnqa3XTLt+3tZauN+yqvOuhMgvfEMffHvULowsA4+wPT8LwAwTFaYPeugiMDBAiuDZ1++PBhB2Dv3r3+3c49Re46ssdlhPt42N17S/yB4fwJk6a6gT2uSbOYeyEeXN8qp6OljmtqbdoF9dKhi/+G3yIBEFWgoI74DPEBD1A45hz8nnPyGWnq0q1XLFkjRp1lX79unK1cs8G4T+4Nu4GEAAZcX8C9lqVVM8dIBd8jJUcECLX5+agdvBOIzoPB/UjHO+s3L75nxo9c58ujkUFF1bBxLOK3aNXOOuae5KqHv0HUfgMG26cuuNjwmr70la/5/wMIf9cxAAgoV2FBEnLaB4BbtnWJOO7E5tY5r4d17X6y3XjTf9vyVesM1aQYpDoAgQqSGqoBHP4eJAIwjggQavPzAYGHgfg82Oq1G7fccdcU50JUDIRGt8Ox7AUCx4AjXY+aSR13ogMCeC+9/Kolz4tKAWj3pqbeZ7ldezpwEJwN4qPakDCkhr02gGUDMNThDTfdYkgobiycXxnODRjsAQCJYA8oRwQIdfHzEWuIM3HKvU4cdHxWizYOBARG/7NPuqGoFo5RKyIWagu1sT3oYgjPuTH0HCNdqBHFA1zv7sn32IlZLf16XAsQYokIIHN+qSy5uVxXXtXXxtxgb7y+xACiKqhOl/ygrpACAGE7IkCozc9f9c67JXfePdV1MJx5QtNsP0bXs+fh3WBGnC8CuSpCh4e/4ee/tWyl4UkBqNIPGM/8QBCkDWPPsdIXigHWbtjy++9+/263A0iDVJ8AZ+M7SQLeFddH8vhNbgBu3Nhb7JmFiwwALNg11FBJuHZDANBgkvBBfj56FxWCSoDwcCV6HgD4W1JfQ3SIcXzT5q6G4PwVa9Z5CmLHngLPG0FYCA33CxCIDvfzndQTng2/Axj+tnTFOzZh4jS/nmIPAQDncw9s3IOYwSUi3He7cK+dgyRd+7Xr7MW/vGx4RbILDQNCUB8QDgJyLKMqPQ+3KbCR2MtwoTMV8Mi1W/fue/O+d8dEF31UjoiPFEB8jCug8B2fMYqp47P894ACSPf94H7jvFWRj44XgkE8GIgtFXAouLVwI3oZVcEeouBOorP5Dj0O1+JS7tq518/13pYdPe8ONgkObx3uCUIrsEPqOEYaUFGumgJoxwfQ2oTjZkFN5gTw/vMb19vCFxdb+UGL3VnRQXRCNXoSMdx7fvAM2bhvv+eKqqCuDwdmTT+LczBuJYRHtUB4AEGVKNhSIAOhEX135YrLPMhSwIO/fcO4W61Tl+5OTPZs8kLYu3cTiIyeRhIAQVIBKHAqnKsH4eHguB3b98S+utxE9gDD3w4fSoPEg0J0AEB17A3SwJ7/5e/8z5bN24dBiNWr1m2ZPGm6R9KKLQBArq+CveZhyybmCJJxIhE60hN+2zRITY/+A+y5FxYbNIEG3DtqUZ4V9opr8wwwENflfvjMveXnp+MM53j0N349xxZOIjfTJSMSdwCQFAAAUlAT9CMuHa4dHA2xxeFwe+qEZk54pACdjFQgHQIIQAiaiGA9xRyIvy1wLA+Ep8N14aSkDq6OfHcIzoOgo3ko/g6R9TuIzt+ShpTvpAIAit8TOZORPXXQcGcU7olnaNq8td9vl159HAhAYI80AAQbUsJv+vQfZM88/5LJUYBOYk7uXeqL6wkU7kF7lwQAAAiIzx6pwLji54sgytuTh0c3L1v1jqeOISYGj5uG8OJuBUQ8FECgbtwljVRSv1OH2O3fm2AEcYj0e9v39ITzeQAeRDWCZGoAQiYDJqkmVM3eKLrl7/yNPcQHNB4cQugzqgwQOI/S27jOeG+AoYCO52lCwEjUHSQkKxhsEb95JCWAwO+bZefY4GGj7A9/ft6DPuhWFN2r3Nmkh5XMu7nqwb9HCqSOyAPxHYCQy1eeB25d+c56G3PjTS62blQjX1zElfsp70dpB37HzcL5+PmAqnQBNwzR5c5yHdzQykiFwPUQT2LMA0FodLwIz3fy5dn4zMNyDAD8HsmAEFJT/ptABNSI0igbNm2bhGsLd6M2UUXYAQgOCNgGgEAiAIh0iDw54g88q4FDR9iil172rC2SyT1wPVQS98p9wwiyE6mamhonOu4lIPCZbefOnTnYCo8awz+/9sZSu/jSy2MPAv+di0J8pAEgILSMK8SXQYb4AwaPcOKT3+ecgArB9x+02N93GxC+gxh8t3VHfg4PACeLeHyGmDt35DvR2fgbv0EiRPik6Mug8xmiAAgcyvm4DswgRgMUtmUr19qcx56wXqcOso7BZiAJgCHbIOnAi1PAh1cnu8J3/QcOsTmPPG5IINeF+Ng1jmUfHIRdu3bF+h81xKbACykhOLr8yi/GaWQuptQyhgsiI7YQHpWkIEwSMHDISNf5uIwqP7quDA/MgyNpzvGBEPKyUH9Kc8CthZGBS3LV9m27Xb2sDK7nxBCHPDT7UYOzpIYgvABR1lO2BdAgBp/l2nI97kXRt8BZ9e7mkofnP2kjz/6knRAYDwlgAwyAwJWFIdEKCvKUdvGtdY6NHHGGzXv8SeO6yjdxX8pJue5X6oEoF0A4Xr58uV111VUeXIG2AiiIf2Kz7BhxeTsCA4lgf9oZnzBcVThbBl0Pp5qvVIDsAJtcUxlqiKcMJnu4FwLDVV/8wn+5D9+j+8mWHcA/5xOfsr//7TVD1Pld7BKG8yjVABHkzpZHrrbUojK9MIcyvkWVgQkqqlMr1m+0nzwy18FADbUPNGkdBXtE+MpnQSOSjF75C6qrc+dgQ9q2t06dcm1AsIOzH5xjSC/3I5vmD8oFca3ghCUrVttlV1ztvjLFE0WwCudlC5TjgeioI+wBKQny9dPu/aEpT1/fQAag5J1V7D/oNWZqw9d8+StxmVN1Be7vvM9cZAI9vy7BVJRy+bdbFJlLconAZwcVc8llV6ZzUYHheH6uDV2UasHTgjFhUv5OopAkIUw9NEgGjkBxxCTOCXAgD4q7RgJLCTPl9JXLkUriYgQzgIDex+s5ud9AT5zpXFu27R5W0AChfTJI5LweIAbOHHnGWXF+SXUFHp6CD8+h1EZ9QcBDU5zE8yglD8POf/KXdsHFlznzwbSSBFfVgS6oZUAAEH6DvZQTc8ZZ59qbS1YaUhmLIjrx4s+NdlGC0CqSsPGwCu9VIFE1C1dz6j0/8AhXxRoFdVUNkG/nvMlqHNKAm8w9KdWh+gP3iFQ8u+ivDkJRXcqvtYDAtaGN8lLJ51OUDBhIoCJuL8UGQiuDq2wBoLApWL308qsN2xYnuzBQiI1HiYHLITCekFLM2pACLnLKoKFes+WGuDn+n5vVTXKDuyPDU191pDyR9DfSwH2qFqFknKR14XMvui2CgPUFQSkbqSTRy+1XRXXMHLijT//f7+yT51+QzktFjoqkASkQMEgGaqzvKYPdPsSVJNIORL3iLnlAyr/jfqnIfuUXvmxwJMTgBuTbA4RukPMiGfUFQe5s0n2EIDAMIKjG7J5a5D4jCU6YBlBHMBLPwvW5F9QRfUsQfU9hmum8rynKItCeM33GD+MYiUBWLrwSmByzzzupt/3t5Vcthd/OBTZu2XGth+vhwdStwMOh61T1UhmRvw0YMtzm//xpw8/fvHXXeXBpUn8jvg3SrRClSzgfYLPhtaBj4SwRXq4ix+Rz5ArXFwSlH/ZHyTqyBRAbEGAyJAW1S538nQ2bFlMQktcIANhLmBvuVwYBKejeq59H2XhIsbvIdt6nL47rsclULy6pB2ZR8RzjLaPYu+8Am/fE04axAgTnlLK0d9IQhlm63VUL/n14WLhThRruB+Ir4Ya0UnWTQW0IwwwIXJ8oHs8MgiMF3koZ7oUo+xs3jItLr958EAgPkWEUqSO6RmQjkJIxN9ycBoEHQ8+ROMOjoW6rgIyTyR2VTZARVCEmGRHjusEtUh91Ugd1UEcCgmNA4BiphaOwXUivmAcivPLaW7GbWl8Q5B57JS9IARJA5x6u8rZd+SkIyb1AC9HMi0MBAHlDutdkfm3I8NPtjwsXmbuopVExm0CIIGjJ2yvsitHX2PHHNfVCRlY2LSX9AschFRREuCBeQI/wfR+XEjgQsPCaBg0bafOe/IWhG2UzVGeW/mRfqGg1qBlFuAqsYimIVFzSHvA/EAWCI/aIuCp0HreE755ZlDbMhXUoxENcGVttfMc9e5xBtjXyIFE7StuPvfm2dPtMwjOTalQ2wQEJUgAdWwV1xHGTEC+cPuosLw4p4+vhv1K85F6Ud18w/ym77NIrghrqHwjd3gEAiNxufQMQfM7zTfZCESNgoB6wGQue+qXJsCo5JyOeDObU0UA0m8z9VEQAZBIENXslCzJKZcjr0zNQqr351u84J0vVoKa9JTNqLlNzgurXFI5ygkQAxOBBw23GfbOMFIyYzkFIJrqUTxFH8t2DDy+wCz97ZbDwIYjLQZS6hMivb1BBVMjS4oc6kL+udhMZdyJo0hc8EKqEIEfupqcwIqIDBLkfpZsBpDEkQWkSbBkGH+bwnFUkwdwzTstFl1zuhJfrKWPLfShiZ/NeqahmDSjdgwfUL9jNqVPu9YYB1TiUQnEQIABcKGKon4YfVEaWH/Wx4Oe/8uiQQAOjokBEUiAPRVE1N4OqQi/SOQcYBHUYOB5S/r8qX4AO+OR9VLv19sMMg8DzoXZw0zkvmVupoPUbt95/1jnnxy5lXBfPTet8dD2SoGYzMgxE7BwjDaS0p029zxOL0JPn4nnZqAbGuSPl5tn4o7hREoJPzFZenc7dUE+45PNXxHl0lQNluOWtKMeOkYpb2cPvKCdOnh5uLBg3ek+5ESQQtahii2rGxZF/nkkQZKsgOo5JAMVbI889/6I4Fc8+7g6J0vQYWCQBu6AUvr6nMETmeHvUJiniO+hRMWnzpm3nqY3SCx7JFCsb+ipWD2UAEUCpDLqxtCS4ZkXBQ6hOvf72Eht99TVxZzSbut0QRxknuAR1pUgbYpGXgku+e8ddpoym7JLSu+KeTIMAAAos31q6yhNzcDncjsrxoDChfkjVE2Spp1XSwb5H7/5xwUoN0DwPEq4yLM8LffkeGv8/SeBDsiolm1BcWpQ6bId8X1kd7EUApeZgiI6Li1IVVZWpVWs3lFx4yWUuGTJOqCPEUXGFEytSVUiE0g1IBvpyyuR7TOKqhlsVazINAm7nn55d5BJKNoAYSLbN447A2aqNsOdafCcgkBA4/4mnfu3XVJUOj6siSr2XRWqXQhTaRR3egOEg+I1ExZKkTVAxpaIquJPFBYHwgRj7ShwIACkrLw3gmD8EBf+3l6/yZUsAAKejkkR4uW9KCCrX4w8auKtNeJiBA4baH36/0FSA141nGgRyYMm2F2yZ7lULURQLQXQ1MXBMqZbqG0Zd+SVdV+kbPY8qatAW4pdHTkkahFqCFaUjVH4EYfV98r2nBqK8Ecfk279x/U1x76cHK4lmqqQX5Um39mHfroMDsej5l8yrXVHvUGOAwP+I8MnCTJyljYiu6iHqiGohxJcBVzCpBKNaMT0vV1PjdKSFiGMqlxTO6GphWUGdQFAfjRZNxOmAKIpUN5yyqXAFv8O4XXfjN+MUrlw4ReA8LDaE8l9OTjvLC7pXAYz6i8oj3z2TICgfJmnAhmHn5OFAfLVw0k3x0Jx5lswU6xhXVvfJZ8VFlIjpaKFaKUAoKXuzdEVF3UDgRPj2yZUsAgDp0PciliRDgQ99SYT2cBEPJ6mAiJ6Tys1zaWgZjOE/X3vLZJ/Uip5pEAAAeyYp1UofHaPzca9/+uAcd6/R8yrRKrlIyscbvSJPS+svnFmj2r3aiZACyshqrKgTCEoJq7ynm9DGhTFGyTSzwIA7VIki2gQMGTx8argQVUQNtmPguOee/YsVJGoQjWGYUUUQmy0n6p5Qc/LQkad7MlAEVWQNUyr4VOCpZ9bSMBjTe7UOHHBVBNdLFbHfvXu393XVCQROpK4I/F6atMgaitjsPbsYbkgrcZKFEBX3AYPjDZu3esZRbmt2divLympuJwf37re/+aODIA+iMdSRWnZwSdnoGhx+2n94R50iZ9WZZQOUJveKW4h3qg4cjhe6E/uw/o6YyherBwC2bt06Gs7HDgACzRUFBQV1V0dUj0jdcpEt23cN+9FPHnAdevpZ59hv/7jQFP2K8N6hEFXCtAZM6WA272MK58O1vWvyNGvTpq3l5XWzFsEXX/zXV0wJReKGwqj7IpMgKMMJ8XE1fxUYQeVePRfXFZfzbDCc9D6E53mgE12J3/7u9+2Msz/pHeXLV681FlUChDrWtaSMPVudQKDpl0V9U++daT1O7uerZfCntbCCNV9/CcSTkU72Y+pYvrO8B19lH6Jw2t3XrFlbMnHiZGverJW9+o833EXVYr3GAAHvDc5/PjgFckJULZSOZ1N9RNlUeYtki0lrw1CosqQXyIL2MWPG2IYNGxYjBckeL9SRLzOrCwgTp97jJ02d0DRu6UiuK1bFiDYORJibJPxX3h+ik5dROjvZcwQX0SZeUlKWWrd24zw1RMkzUoItkyCoCpdUn/L2kp5Psl9KG8sAxt1yW7ykS+0uWnziNYYOHax///52880328qVKw3up/cX2uIxOQhqJeEiqBIIs27jlnkU8XlQ9ZHi96uzLrnShofGwCqqBAx8aHF8bSDXRqRMg1DbBudCOAim7sQVK1bYt771reBa5/i1KbWqG509tkWRNSkQZQz6nDLQrr3uRnv2hWBvaqI6S5CoOH+uroEnn/61u2xEvbhqAkAnVaVIG16Or3wJIJzUs6+xNEr61KtSRzkI7kbue79FFGO6bt26LdOnT7cRI0Y4wdVJwX1AAxq9IL7KmMRDqrtgT8mbTblnhttToueYWGwvLv6HE14+vOv9wN3qEOBiOrlA4AI0vv7wxz8z1JAKIXHgcpSDgBuJJCARqBH2+PxEu0jEXZOme6kS2sCsbHTaef07ag1FVaGmuGeYG3cY5qXOEoMgoo2+6kuxbuveu6/vtXBC+XQ2qab+A4b6oj7KmGr8Uqs7n704f5SDoLUb7tNHEsFnrVRFk6xZt2kZtZJRZ57jbY7QRpkC0hyqOShxqfVxgEe22B8QP5+bdnct6izmHzx/Eq18B1WkAJ962MgzPWXrWcPgJ3u/TQQABEoGb0c7CLGrHgVaSAERL0GYpyEiVxWGAwzSGhCXlhalO5J9vHJsfEBKoCf5Mj+Jcj3O5VGpTgktiE41TS18AHX92Ft85Tuqh6DkYLS0dW8i4caxpziOchA0rQDOVw7IJSD4/dgLpSgUKWv5mJZcee4p3JdS/Cp6yd7+8unfpFUIuQ+MMg8DQvJ1HT1KmMG4yPuRASKZ9dVrr/eV70iD8kicRyrOuxWOchC0khV1pEWVWumKVPCsqN9N7+0cjVMi1Y1awmi77YxaS5XAVJqcJVlrVq9fFq+K4YZZdI3+UrsGDyYQknl1vkOU1PJB19nLr7xuGuSUzKMc7SDA/VoYr/FBnm7Yl05P0+J+23fGu8bgPqinIwFaqYRNgPBaRIJhRhq4fxqwuUZcF0ClsCTqiqu/7MRVEEZ0rIUQ7Kk8KRXt2cZ273cgXztmrCe8tJRUUbM6mJNDnlBVSI/GL5BPUQCj/AoPmfHyZkFBvFxYxOU7JAC9rzXJyqGpO5vF6ffO/HHcca2W9+SsDu5FWWIWiyhF0zaAMypE6a+9+mYaBM0jUuMrqon1xNRUvbSXWJ+g7CLHWmwNB2i1JhwAgBR1AIMHIHGHyGrsmTKSIu727duH8fBs6FiJPxuuYaZBUFoZ0BWMKR5g04QAFWkwviyCScZKyQIW7qcaIKBXkyZZninu0qWrNW+e7QCwvEvVTAdBuR1lB5VqYAEDbpc6JlT+k81Q94SaXhUtqgyIXkQyaElUEkxDQJJdeFrIrmVa0rV4Hp70yjAImsNBbkcqkqQb9+M2IKIHKQqm0/CMqGaYjmOcFrU4OhhRK6SMMMQHhI4dO9v48Xe4DSA1ox4vB0HlOB4QLoVz5eUACtlOMoKaCYFOkzpCKrSOGS7QgnKIou4EJbIYk0ktmoQXqRHSv66yIg5EJSAJbFJF/rdGUEcEXmIEDc9i42//fHOZLzaXZmCvTgsxmwetgQ78TbV1BWWooilTptm6dRsWkw/TKlItcHcQtGDO27sPvD86AY5VyY6/Y/2ZQ6pcknJIWrNGxzFGCImA+JoxxA1piMjwUWfa7/70jINBVzNzS+FA1/1RmhdOhPiogsZQRxorocX0GiW3atUqu/322+PGLxFeCzy0fluRMNeGSdWyj2fEYvmCgqLUtq274s5GWoy8qY5Vquo7Uo1YBkfZROlyxRHKKrK+l1CdZVLciEJzbSqOaIgIREGdaQwaN0rTMIutAUMPLQlQJMr3qIXGkASIDxMQHa9Zs8bGjRtnWVlZgYvbx6tTUbnifp4PhlNXuGYnefNC+P34Oyd5HXp/NASFniM67nRNDTFU87OrIJUtlfPHvUQqtLxVRlspXY5Z38xCQdo+RHSlNBRLeICXWMcluyJi9ezT3+bPn2+oA/dEgg2A8MrNeHdCptsgq9KpCfJAY8eODbo7xEhtg2fYunXwaDo7sTWzg14jdV3Ek2oSXYjUXHykdOSeQyuKU3SNUDN3yYua3TSLw0GQCkqO01HXNCeSq6m/K0WtjotXX19iU6bP9MKI+vEBJamOyMqqSw8QvMuiXbqPs2XLlp6NnDt3rkkCkAi8FufQDIMA8W+99VZPS7Pl5QW3u02bYFC7OBBq+pIrqmfUZ6SamouPhN5/0FNAcnBKoiZrmr5QPwCibkN14TkI9Q1m1MG9auXaElwv2r/lF+MRJJul8Ci0woaH8QRX1FrCZ4pCIrjcwkyDoK5BteDEbZzRonhUUnZ2tu8BiX1ubq6NHDkyGNwpVl/6NQgIGleghq1NG7eO/vGPfmqnn36m9xMhzlJN6vHUQmuNQ0Mi+A0lRpUW5TJnGoTkqqNkZyD35h3oHTq4VEB89v369bNJkyaZ4ogjAgSNjVELpUbLIBkPPDDbe3bQnRq9I3uhApE63vCzf/+n50xdHEqJZxoErdEGBGoobFoGhtTC9QDRu3dvmzFjhqEisVt0UGDUjwgQILj6LdXHKneMv7Gyk/Qu3hREF9EU5scjMcMDU1RSc1lSCjIJgpZ5JdfmMX1eKnPIkCHO+dirZLFeUfURAwJSoE5jfce+SgvuwmeqbiwslGSo1YSARotJXnjp76YEoCLVTIOgNXdSRzAFbjRZYrw/YhgVcZACvDg8Kg3nOkJASLtcWuOQnOOTHzV80TCmPlbWTT++4Bd24Wc/70BozjWEJN+UnIEkQDLdEEx0qz5UVq/i7ajjEAnAU0sO4YX4Gkd9RICwbevuVHXVoXjMmdq/1dirYJAOPvS9MqqAM3fez+3TF12SnkEaCIl3BKHp5NMC8oz3HUXEpxNixqz7jX4o1irHrnpUS4DwqCJlXXGjfVL+kQACAJQUV7hE4PtqNhEgFETDBPGdlS4n8AMAzTpiQfZPZz9in/v8Vfa3f7zhvf5qOFaPZyZBYJUpy7f8BRdMb9lT4EvD1PilYeySBNWYOT5ibEJtmxabyGvSMD4NElR7oHL6EnlVrzK+hDaqIyhtAteL8KihTNOnUUDQCE1JhkZpxhMRE4V0ZU/V3eBqINPLpaLFG4DAdSG8MqrOCMcCCIofNA7tQPR2DvWcQmiIrymUnjmNAHEjmGEQILzyVmr0knQ0lPfzoYPg3BZ5TEmjHY9UDg8sly/pDsa9/I2gjtS2roUcqiv7RPxjAQStztcbOWQbFFuICOJAolHsAoA0Ripbrx5I1jDU6KU1ZUc9CNgATQvAc9LcCk3xlTFWr6dy+7iC/n2GQZDqw/3UTFi9iqCh0hIfOgjJmaQ+ISCa66CCBr3727ZtO09NVhAFQsCREKYxQOAe2OB8NRsgDd5hdyyAoOElsgNUmThm2gnvJqBwwkY1a9myZaaOB1RRY6ijCRMmeHaUdPWgQYNs1qxZJhe1oeKADx+EKOhJvoCUQYHeFBVV5PQKLwpDr7+13FTf9iGxlel3sanbW6tp4kkBtYDARlDI+QgcicLJzhIUkjrRAvJ4Qk3nbjZz1k9M4B8TIEB0iKoWfB6emUHx26Ki0WT09ZO/Z/nVG2+v8LHOPqV3b3rwn6bLa9kqCTcvldYCQvItI5xTVcF4uGy0tEkNCRrFr3VqxwQIWgOtRjAIAgeqwqbJKXrxBQUfTdD1ekJFta8Joz9K8+84H9xbFxAqEvkrDUmkyxDAfWRm5zyfdKnBJ1yfxKJaQ48JEEjGQTi4kGP2rINIjjBGNSWH9rFnYgojGlgZiUpSg7HetQDBPP1cCwgaCaHJxUgAVTN6hLxtJVp7pzVmqMfPXHSpqe/qmAAB9YEESBdDGNrHvX4btdqreZYVLhBIw/rI6f/9tTd8np5WTaryhk3wbsBaQFCnH9c+/4JLYslTi446JTTclm5qbJYW0B8TIChtrVWcSAUS8cjcBfGwVtYQA4SaxpKvhKGbYf2m9+7XzDytI4ZgPmupNu8osklMLVO3HOeNJzVGS5m06vKBh+aa+rDKGug9ah86CPJQUAVa+yuj+/Cj8+P6M4vtfPp6Yvw/OhvCMIsIY63mNPS6BlvVxTti3qvq21p1hCMA16vjnG3u/CdN7xDiXo8ZECQBGs+jt1O5qAcuZbmtevu1NFfAaCgJhD3z7PN8GrwqdKgiLef6IBCoU2hkfnKcWrz6KBomwqpVPDENwY17q44FEGrbKKDMnvOYt71o7I1cRipe6gjHaA477QxjdAEuq6ax+DrhIDkQGjDwml58+RWjOnbupy90ENVXpFev8Fnz+hhs8sSCX1jytWGkV5Tl/UiAgNGlc+2Bhx/1rgeIA7F8+Ej09hKK8XRAMNKBEflvLl3hf/dxaYH4cje9NT8AgyQwhUz6noUtnIvfAzJA6T3OjwXbRH6LqqC6RfRaMNXKj3kQKG96FFxWkXro0cedMMm3iuPDqy1fBBwyYlQ86FCdfFpdxPrgXn1Picc2S2L04g25ohzPeXyBD4rVkEBqHgJBU2Y+EiDodV54PBhcbIS6nhXR6q3iUksQUt9hbJMzqLVgWyskOQZA9b4CCgA9PHeeMQonHrgYEZ57Uq3jIyMJGOwd0RBarWPjzRxarKiRxxpWhRoRAHwm50Rgh21ANQEC0qAOcK2jSDad/Wz2o6bF72pa416S71tODjk55kGQ26lRPeq+w31lJWRyjKdWP7JHTfnc1SjQQyXxIlXNXxV46ntVrkqT7ZVMhNDqjhYAMswN9b7lIx4Evb1Wr9TSmwZxLwmcICo2AuOaTDGwuZ4PRNYMa48vovcBaS6rxiojBQ8+/JhpXqmSikwlVo0jOSdcHSIfGRDkl2MXFNBBJCTi8Seeen9yZNQ1rZcuKXek1Ie330cvs9abRaSGkCyNP9Dain3RmgEWcGgwLiBocq/2xz4ItWxyXyEunK/pM3Jf9c4CvV9HS1k1g6i+cYDsw7/bPhIgsMqTSPZ/H3goPdwqmluqd/woAENSfAJxTsf4lcMAUt844GMQytIRNQEd1bU/P/eCnXbm2fGL5fS2K8BgZL5PU4nWzrGWjiRhfeOAj0EIG8NL2BiIiGpiKOL375rkhMcVRRVpXoQb5SABV3/xK6bVp/WNAz4Goez9Nw5qTh/eE54TK+wJ7BhucsU1X7KvXz/Wxk+Y6O9Yw7vSq2PqGwc0Bgj/AneRLywfDSisAAAAAElFTkSuQmCC"
                  />
                </defs>
                <style />
                <use href="#img1" x="24" y="35" />
              </svg>
              <span>Lên 1 lớp</span>
            </button>
            <button
              onClick={() => onClickButton('zindex-down')}
              className="grow text-black rounded flex gap-1 items-center mobile-touch pl-0.5 py-0.5 justify-start hover:bg-gray-100 w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.2"
                viewBox="0 0 159 155"
                className="w-7 h-7 5xl:w-12 5xl:h-12"
              >
                <defs>
                  <image
                    width="97"
                    height="98"
                    id="img1"
                    href="data:image/png;base64,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"
                  />
                </defs>
                <style />
                <use href="#img1" x="24" y="35" />
              </svg>
              <span>Xuống 1 lớp</span>
            </button>
          </div>
          <div className="NAME-form-group NAME-form-color flex flex-1 justify-center gap-1 rounded">
            <button
              onClick={() => setShowColorPicker((pre) => !pre)}
              className="grow text-black rounded flex gap-1 items-center mobile-touch pl-0.5 py-2 justify-start hover:bg-gray-100 w-full"
            >
              <div className="flex gap-1 mx-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#fff"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-palette-icon lucide-palette text-white mx-1 w-5 h-5 5xl:w-7 5xl:h-7"
                >
                  <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
                  <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                  <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                  <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                  <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                </svg>
              </div>
              <p>Màu chữ</p>
            </button>
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
          <div className="NAME-form-group NAME-form-font flex flex-1 justify-center gap-1 relative rounded">
            <div
              onClick={() => setShowTextFontPicker((pre) => !pre)}
              className="grow text-black rounded flex gap-1 items-center mobile-touch pl-0.5 py-2 justify-start hover:bg-gray-100 w-full"
            >
              <div className="flex gap-1 mx-1">
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
                  className="lucide lucide-type-outline-icon lucide-type-outline mx-1 w-5 h-5 5xl:w-7 5xl:h-7"
                >
                  <path d="M14 16.5a.5.5 0 0 0 .5.5h.5a2 2 0 0 1 0 4H9a2 2 0 0 1 0-4h.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V8a2 2 0 0 1-4 0V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-4 0v-.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5Z" />
                </svg>
              </div>
              <p>Font chữ</p>
            </div>
            {showTextFontPicker &&
              createPortal(
                <TextFontPicker
                  onHideShow={setShowTextFontPicker}
                  onSelectFont={handleSelectFont}
                />,
                document.body
              )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
