import { createInitialConstants } from '@/utils/contants'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { TElementType } from '@/utils/types/global'
import { useEffect, useRef, useState } from 'react'
import { CropElementModal } from './CropElementModal'
import { createPortal } from 'react-dom'
import { useEditedElementStore } from '@/stores/element/element.store'
import { useTemplateStore } from '@/stores/ui/template.store'

type TCropElementModalWrapperProps = {
  frameId: string
  imageUrl: string
}

const CropImageModalWrapper = ({ frameId, imageUrl }: TCropElementModalWrapperProps) => {
  const [showCropModal, setShowCropModal] = useState<boolean>(false)

  const handleCropComplete = (_: string, croppedImageUrl: string) => {
    useTemplateStore.getState().updateFrameImageURL(croppedImageUrl, frameId)
    useEditedElementStore.getState().updateSelectedElement({ elementURL: croppedImageUrl })
    setShowCropModal(false)
  }

  return (
    <>
      <button
        onClick={() => setShowCropModal(true)}
        className="group flex flex-nowrap items-center justify-center font-bold gap-1 text-inherit rounded p-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-crop-icon lucide-crop w-4 h-4 smd:w-5 smd:h-5"
        >
          <path d="M6 2v14a2 2 0 0 0 2 2h14" />
          <path d="M18 22V8a2 2 0 0 0-2-2H2" />
        </svg>
        <span>Cắt ảnh</span>
      </button>

      {showCropModal &&
        imageUrl &&
        createPortal(
          <CropElementModal
            elementId={frameId}
            imageUrl={imageUrl}
            onClose={() => setShowCropModal(false)}
            onCropComplete={handleCropComplete}
          />,
          document.body
        )}
    </>
  )
}

type TRemovePrintedElementFromFrameProps = {
  frameId: string
}

const RemovePrintedElementFromFrame = ({ frameId }: TRemovePrintedElementFromFrameProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false)

  const handleRemoveFrameImage = () => {
    useTemplateStore.getState().removeFrameImage(frameId)
    useEditedElementStore.getState().cancelSelectingElement()
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="group flex flex-nowrap items-center justify-center font-bold gap-1 text-inherit rounded p-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-trash2-icon lucide-trash-2 w-4 h-4 smd:w-5 smd:h-5"
        >
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        <span>Xóa ảnh</span>
      </button>

      {showDeleteConfirm &&
        createPortal(
          <div className="NAME-remove-printed-element-modal fixed inset-0 flex items-center justify-center z-99">
            <div
              className="bg-black/50 z-10 absolute inset-0"
              onClick={() => setShowDeleteConfirm(false)}
            ></div>
            <div className="relative z-20 bg-white p-4 rounded shadow-lg">
              <div>
                <p className="font-bold">Bạn xác nhận sẽ xóa ảnh?</p>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="py-2 px-4 font-bold rounded bg-gray-600 text-white"
                >
                  Hủy
                </button>
                <button
                  onClick={handleRemoveFrameImage}
                  className="flex items-center justify-center gap-1.5 cursor-pointer mobile-touch py-2 px-4 font-bold rounded bg-main-cl text-white"
                >
                  <span>Xác nhận</span>
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
                    className="lucide lucide-check-icon lucide-check"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

type TChangePrintedImageProps = {
  frameId: string
}

const ChangePrintedImage = ({ frameId }: TChangePrintedImageProps) => {
  const handleShowPrintedImagesModal = () => {
    eventEmitter.emit(EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL, true, frameId)
  }

  return (
    <button
      onClick={handleShowPrintedImagesModal}
      className="group flex flex-nowrap items-center justify-center font-bold gap-1 text-inherit rounded p-1"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
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
      <span>Đổi ảnh</span>
    </button>
  )
}

type TPropertyType = 'scale' | 'angle' | 'posXY' | 'zindex-up' | 'zindex-down'

type PrintedImageMenuProps = {
  frameId: string
  onClose: () => void
  printedImageURL: string
}

export const TemplateFrameMenu = ({ frameId, onClose, printedImageURL }: PrintedImageMenuProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null)
  const rootElement = useEditedElementStore((s) => s.selectedElement?.rootElement)

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
    zindex?: number
  ) => {
    eventEmitter.emit(
      EInternalEvents.SUBMIT_PRINTED_IMAGE_ELE_PROPS,
      frameId,
      scale,
      angle,
      posX,
      posY,
      zindex
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
  }

  const listenElementProps = (idOfElement: string | null, type: TElementType) => {
    if (type !== 'printed-image' || frameId !== idOfElement) return
    const dataset = JSON.parse(rootElement?.getAttribute('data-visual-state') || '{}')
    const { scale, angle, position } = dataset as any
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

  useEffect(() => {
    listenElementProps(frameId, 'printed-image')
    eventEmitter.on(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    return () => {
      eventEmitter.off(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    }
  }, [frameId])

  return (
    <div
      ref={menuRef}
      className="NAME-menu-section NAME-menu-template-frame STYLE-hide-scrollbar smd:text-sm smd:mt-2 smd:px-0 px-2 text-sm w-full"
    >
      <h3 className="smd:text-sm smd:mt-3 text-xs mb-1 font-bold">Tùy chỉnh ảnh photobooth</h3>
      <div className="s2xl:grid-cols-3 smd:grid-cols-2 sms:grid-cols-4 grid-cols-2 spmd:gap-2 gap-1 grid rounded-md">
        <div className="NAME-form-group NAME-form-crop h-8 smd:h-9 mobile-touch cursor-pointer border-2 border-main-cl text-white hover:bg-white hover:text-main-cl flex items-center justify-center bg-main-cl rounded px-1 shadow">
          <ChangePrintedImage frameId={frameId} />
        </div>
        <div className="flex items-center justify-center h-8 smd:h-9 mobile-touch cursor-pointer border-2 border-main-cl z-30 text-white bg-main-cl rounded hover:bg-white hover:text-main-cl w-full">
          <button
            onClick={onClose}
            className="group flex items-center justify-center h-7 w-full text-inherit rounded p-1"
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
