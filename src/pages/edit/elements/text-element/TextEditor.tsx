import { useEditedElementStore } from '@/stores/element/element.store'
import { createInitialConstants } from '@/utils/contants'
import { useEffect, useRef, useState } from 'react'
import { TextElementMenu } from './Menu'
import { generateUniqueId } from '@/utils/helpers'
import { cancelSelectingZoomingImages } from '../../helpers'
import { ETextFieldNameForKeyBoard } from '@/providers/GlobalKeyboardProvider'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { createPortal } from 'react-dom'
import { calculateInitialTextElementPosition } from '../helpers'
import { useEditAreaStore } from '@/stores/ui/edit-area.store'
import { TextElementMenuForDesktop } from './Menu-ForDesktop'

type TEditorModalProps = {
  onClose: () => void
}

const EditorModal = ({ onClose }: TEditorModalProps) => {
  const [text, setText] = useState<string>('')

  const handleAddText = () => {
    if (text.trim()) {
      const elementId = generateUniqueId()
      const scaleFactor = useEditAreaStore.getState().editAreaScaleValue
      const fontSize = createInitialConstants<number>('ELEMENT_TEXT_FONT_SIZE')
      const fontFamily = createInitialConstants<string>('ELEMENT_TEXT_FONT_FAMILY')
      const fontWeight = createInitialConstants<number>('ELEMENT_TEXT_FONT_WEIGHT')
      useEditedElementStore.getState().addTextElement([
        {
          id: elementId,
          content: text,
          angle: createInitialConstants<number>('ELEMENT_ROTATION'),
          position: calculateInitialTextElementPosition(
            scaleFactor,
            text,
            `${fontSize}px`,
            1,
            fontFamily,
            `${fontWeight}`
          ),
          fontSize,
          textColor: createInitialConstants<string>('ELEMENT_TEXT_COLOR'),
          fontFamily,
          fontWeight,
          zindex: createInitialConstants<number>('ELEMENT_ZINDEX'),
          mountType: 'from-new',
          scale: createInitialConstants<number>('ELEMENT_ZOOM'),
        },
      ])
      useElementLayerStore.getState().addElementLayers([
        {
          elementId,
          elementType: 'text',
          index: createInitialConstants<number>('ELEMENT_ZINDEX'),
        },
      ])
      useEditedElementStore.getState().selectElement(elementId, 'text')
      setText('')
      onClose()
    }
  }

  const handleEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }

  const catchEnterKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddText()
    }
  }

  const handleClose = () => {
    const virtualKeyboardWrapper = document.body.querySelector<HTMLElement>(
      '.NAME-virtual-keyboard-wrapper'
    )
    if (virtualKeyboardWrapper) {
      if (virtualKeyboardWrapper.getAttribute('data-virtual-keyboard-shown') === 'false') {
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <div className="5xl:text-3xl fixed inset-0 flex justify-center z-99 animate-pop-in p-2">
      <div
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
        }}
        className="bg-black/50 absolute inset-0 z-10"
      ></div>
      <div className="bg-white w-full rounded-xl p-3 shadow-2xl relative z-20 h-fit">
        <div className="flex items-center justify-between mb-2">
          <h3 className="5xl:text-3xl text-xl font-bold text-gray-800">Thêm văn bản</h3>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="p-2 active:bg-gray-100 rounded-full touch-target"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x-icon lucide-x text-black h-6 w-6 5xl:w-10 5xl:h-10"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mt-4">
          <input
            type="text"
            onChange={handleEdit}
            onKeyDown={catchEnterKey}
            placeholder="Nhập văn bản tại đây..."
            className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} 5xl:text-[1em] w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg`}
            autoFocus
          />

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAddText()
            }}
            disabled={!text.trim()}
            className="5xl:text-[1em] sm:text-base smd:text-lg text-sm w-full bg-primary active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-xl shadow-lg touch-target flex items-center justify-center gap-2 transition"
            id="NAME-add-text-element-confirm-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-plus-icon lucide-plus h-6 w-6 5xl:w-10 5xl:h-10"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            <span>Thêm chữ vào sản phẩm</span>
          </button>
        </div>
      </div>
    </div>
  )
}

type TEditorModalWrapperProps = {
  showEditorModal: boolean
  setShowEditorModal: (show: boolean) => void
}

export const EditorModalWrapper = ({
  showEditorModal,
  setShowEditorModal,
}: TEditorModalWrapperProps) => {
  useEffect(() => {
    const listenAddTextOnDoneKeyboard = (textContent: string) => {
      document.body.querySelector<HTMLElement>('#NAME-add-text-element-confirm-button')?.click()
    }
    eventEmitter.on(EInternalEvents.ADD_TEXT_ON_DONE_KEYBOARD, listenAddTextOnDoneKeyboard)
    return () => {
      eventEmitter.off(EInternalEvents.ADD_TEXT_ON_DONE_KEYBOARD, listenAddTextOnDoneKeyboard)
    }
  }, [])

  return (
    <>
      <button className="p-2 flex flex-col items-center -rotate-6 gap-2 cursor-pointer mobile-touch bg-white rounded-md active:bg-light-orange-cl touch-target transition">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-type-icon lucide-type text-main-cl w-6 h-6 smd:w-6 smd:h-6 5xl:w-12 5xl:h-12"
        >
          <path d="M12 4v16" />
          <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
          <path d="M9 20h6" />
        </svg>
      </button>

      {showEditorModal &&
        createPortal(<EditorModal onClose={() => setShowEditorModal(false)} />, document.body)}
    </>
  )
}

export const TextMenuWrapper = () => {
  const selectedElement = useEditedElementStore((state) => state.selectedElement)
  const { elementType, elementId } = selectedElement || {}
  const cancelSelectingElement = useEditedElementStore((state) => state.cancelSelectingElement)

  const scrollToSelectedElement = () => {
    // if (elementType !== 'text') return
    // if (window.innerWidth < 662) {
    //   document.body
    //     .querySelector('.NAME-print-area-container')
    //     ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // } else {
    //   document.body
    //     .querySelector('.NAME-menu-text-element')
    //     ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // }
  }

  useEffect(() => {
    scrollToSelectedElement()
  }, [elementId, elementType])

  return (
    elementType === 'text' &&
    elementId && (
      <div className="smd:block hidden w-full">
        <TextElementMenuForDesktop elementId={elementId} onClose={cancelSelectingElement} />
      </div>
    )
  )
}

export const TextEditor = () => {
  const selectedElement = useEditedElementStore((state) => state.selectedElement)
  const { elementType } = selectedElement || {}
  const containerRef = useRef<HTMLDivElement>(null)
  const [showEditorModal, setShowEditorModal] = useState(false)

  const handleSelectElement = () => {
    // nếu không phải frame và màn hình đang có kích thước nhỏ hơn smd thì ẩn container
    // if (elementType && elementType !== 'text' && window.innerWidth < 662) {
    //   containerRef.current?.classList.add('hidden')
    // } else {
    //   containerRef.current?.classList.remove('hidden')
    // }
  }

  useEffect(() => {
    handleSelectElement()
  }, [elementType])

  useEffect(() => {
    // const displayContainerOnResize = () => {
    //   if (window.innerWidth >= 662) {
    //     containerRef.current?.classList.remove('hidden')
    //   } else {
    //     handleSelectElement()
    //   }
    // }
    // window.addEventListener('resize', displayContainerOnResize)
    // return () => {
    //   window.removeEventListener('resize', displayContainerOnResize)
    // }
  }, [elementType])

  return (
    <div
      ref={containerRef}
      onClick={() => setShowEditorModal(true)}
      className="5xl:text-[1.5em] cursor-pointer flex items-center justify-center mt-2 gap-1 bg-white flex-1 rounded-md px-1"
    >
      <EditorModalWrapper
        showEditorModal={showEditorModal}
        setShowEditorModal={setShowEditorModal}
      />
      <p className="5xl:text-[0.8em] smd:text-sm text-xs font-bold text-gray-800 leading-none">
        Thêm văn bản
      </p>
      {/* <TextMenuWrapper /> */}
    </div>
  )
}
