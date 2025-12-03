import { useEditedElementStore } from '@/stores/element/element.store'
import { createInitialConstants } from '@/utils/contants'
import { useEffect, useRef, useState } from 'react'
import { TextElementMenu } from './Menu'
import { generateUniqueId } from '@/utils/helpers'
import { cancelSelectingZoomingImages } from '../../helpers'

type TEditorModalProps = {
  onClose: () => void
}

const EditorModal = ({ onClose }: TEditorModalProps) => {
  const [text, setText] = useState<string>('')

  const handleAddText = () => {
    if (text.trim()) {
      const elementId = generateUniqueId()
      useEditedElementStore.getState().addTextElement([
        {
          id: elementId,
          content: text,
          angle: createInitialConstants<number>('ELEMENT_ROTATION'),
          position: {
            x: createInitialConstants<number>('ELEMENT_X'),
            y: createInitialConstants<number>('ELEMENT_Y'),
          },
          fontSize: createInitialConstants<number>('ELEMENT_TEXT_FONT_SIZE'),
          textColor: createInitialConstants<string>('ELEMENT_TEXT_COLOR'),
          fontFamily: createInitialConstants<string>('ELEMENT_TEXT_FONT_FAMILY'),
          fontWeight: createInitialConstants<number>('ELEMENT_TEXT_FONT_WEIGHT'),
          zindex: createInitialConstants<number>('ELEMENT_ZINDEX'),
          mountType: 'from-new',
          scale: createInitialConstants<number>('ELEMENT_ZOOM'),
        },
      ])
      // useEditedElementStore.getState().selectElement(elementId, 'text')
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-99 animate-pop-in p-2">
      <div onClick={onClose} className="bg-black/50 absolute inset-0 z-10"></div>
      <div className="bg-white w-full rounded-xl p-3 shadow-2xl relative z-20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800">Thêm chữ</h3>
          <button onClick={onClose} className="p-2 active:bg-gray-100 rounded-full touch-target">
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
              className="lucide lucide-x-icon lucide-x text-black"
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
            placeholder="Nhập chữ tại đây..."
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            autoFocus
          />

          <button
            onClick={handleAddText}
            disabled={!text.trim()}
            className="sm:text-base smd:text-lg text-sm w-full bg-primary active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-xl shadow-lg touch-target flex items-center justify-center gap-2 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-plus-icon lucide-plus"
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

export const EditorModalWrapper = () => {
  const [showEditorModal, setShowEditorModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowEditorModal(true)}
        className="smd:p-3 p-2 flex flex-col items-center -rotate-6 gap-2 cursor-pointer mobile-touch bg-white rounded-md active:bg-light-orange-cl touch-target transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-type-icon lucide-type text-main-cl w-6 h-6 smd:w-8 smd:h-8"
        >
          <path d="M12 4v16" />
          <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
          <path d="M9 20h6" />
        </svg>
      </button>

      {showEditorModal && <EditorModal onClose={() => setShowEditorModal(false)} />}
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
        <TextElementMenu elementId={elementId} onClose={cancelSelectingElement} />
      </div>
    )
  )
}

export const TextEditor = () => {
  const selectedElement = useEditedElementStore((state) => state.selectedElement)
  const { elementType } = selectedElement || {}
  const containerRef = useRef<HTMLDivElement>(null)

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
    <div ref={containerRef} className="smd:mt-4 mt-2 flex-1">
      <h3 className="smd:text-base text-xs mb-1 font-bold text-gray-800">Thêm văn bản</h3>
      <EditorModalWrapper />
      {/* <TextMenuWrapper /> */}
    </div>
  )
}
