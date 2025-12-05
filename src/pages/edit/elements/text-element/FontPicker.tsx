import { useDebouncedCallback } from '@/hooks/use-debounce'
import { useFontLoader } from '@/hooks/use-font'
import { ETextFieldNameForKeyBoard } from '@/providers/GlobalKeyboardProvider'
import { useEditedElementStore } from '@/stores/element/element.store'
import { detectColorFormat, rgbStringToHex } from '@/utils/helpers'
import { TTextVisualState } from '@/utils/types/global'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'

type TextFontPickerProps = {
  onHideShow: (show: boolean) => void
  onSelectFont: (fontFamily: string) => void
}

export const TextFontPicker = ({ onHideShow, onSelectFont }: TextFontPickerProps) => {
  const { allLoadedFonts, fontLoadStatus } = useFontLoader()
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [currentTextFont, setCurrentTextFont] = useState<string>('')
  const pickerContainerRef = useRef<HTMLDivElement>(null)

  const onSearchFont = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value)
  }, 200)

  const handleSelectFont = (fontFamily: string) => {
    onSelectFont(fontFamily)
    onHideShow(false)
  }

  const filteredFonts = useMemo(
    () =>
      allLoadedFonts?.filter((font) =>
        font.fontFamily.toLowerCase().includes(searchKeyword.toLowerCase())
      ) || [],
    [allLoadedFonts, searchKeyword]
  )

  const scrollToCurrentFont = () => {
    if (!currentTextFont) return
    pickerContainerRef.current
      ?.querySelector<HTMLElement>('.NAME-text-font[data-is-picked="true"]')
      ?.scrollIntoView({ block: 'center', behavior: 'instant' })
  }

  const initTextFontOnShow = () => {
    requestAnimationFrame(() => {
      const selectedElement = useEditedElementStore.getState().selectedElement
      if (!selectedElement) return
      const dataVisualState = document.body
        .querySelector<HTMLElement>(
          '.NAME-print-area-container .NAME-root-element[data-root-element-id="' +
            selectedElement.elementId +
            '"]'
        )
        ?.getAttribute('data-visual-state')
      if (!dataVisualState) return
      let textFont = (JSON.parse(dataVisualState) as TTextVisualState).fontFamily
      if (textFont && detectColorFormat(textFont) === 'rgb') {
        textFont = rgbStringToHex(textFont) || ''
        if (!textFont) {
          toast.error('Mã màu không hợp lệ. Vui lòng thử lại.')
          return
        }
      }
      setCurrentTextFont(textFont)
      scrollToCurrentFont()
    })
  }

  useEffect(() => {
    if (!searchKeyword) {
      scrollToCurrentFont()
    }
  }, [searchKeyword])

  useEffect(() => {
    scrollToCurrentFont()
  }, [currentTextFont])

  useEffect(() => {
    initTextFontOnShow()
  }, [])

  const isLoading = fontLoadStatus === 'loading'

  return (
    <div
      ref={pickerContainerRef}
      className="NAME-text-font-picker 5xl:text-3xl fixed inset-0 flex items-center justify-center z-99 animate-pop-in"
    >
      <div onClick={() => onHideShow(false)} className="bg-black/60 absolute inset-0 z-10"></div>
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-3 h-[95vh] flex flex-col relative z-20 overflow-hidden">
        {/* Header với gradient */}
        <div className="bg-main-cl px-3 py-2.5 flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white shrink-0 w-5 h-5 5xl:w-12 5xl:h-12"
            >
              <path d="M14 16.5a.5.5 0 0 0 .5.5h.5a2 2 0 0 1 0 4H9a2 2 0 0 1 0-4h.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V8a2 2 0 0 1-4 0V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-4 0v-.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5Z" />
            </svg>
            <input
              type="text"
              onChange={onSearchFont}
              placeholder="Tìm kiếm font chữ..."
              className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} text-[1em] flex-1 px-2.5 py-1.5 text-black bg-white/95 rounded outline-none text-sm placeholder:text-gray-400`}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={() => onHideShow(false)}
            className="text-white hover:bg-white/20 mobile-touch rounded-lg p-1.5 transition-colors shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 5xl:w-12 5xl:h-12"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Title bar */}
        <div className="bg-superlight-main-cl px-3 py-2 border-b border-light-main-cl">
          <div className="flex items-center justify-between">
            <h3 className="5xl:text-[0.8em] text-sm font-bold text-gray-800">Font chữ phổ biến</h3>
            <span className="5xl:text-[0.8em] text-xs font-medium text-main-cl bg-white px-2 py-0.5 rounded-full">
              <span>{filteredFonts.length}</span> fonts
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 bg-gray-50">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 h-10 text-main-cl animate-spin 5xl:w-12 5xl:h-12"
              >
                <path d="M12 2v4" />
                <path d="m16.2 7.8 2.9-2.9" />
                <path d="M18 12h4" />
                <path d="m16.2 16.2 2.9 2.9" />
                <path d="M12 18v4" />
                <path d="m4.9 19.1 2.9-2.9" />
                <path d="M2 12h4" />
                <path d="m4.9 4.9 2.9 2.9" />
              </svg>
              <p className="5xl:text-[1em] text-gray-600 font-medium text-sm">Đang tải fonts...</p>
            </div>
          )}

          {/* Danh sách font */}
          {!isLoading && (
            <div className="p-2 space-y-1.5">
              {filteredFonts.map(({ fontFamily }, index) => (
                <div
                  key={fontFamily}
                  onClick={() => handleSelectFont(fontFamily)}
                  className={`${
                    fontFamily === currentTextFont ? 'border-main-cl bg-light-main-cl' : ''
                  } NAME-text-font group cursor-pointer hover:bg-light-main-cl border-2 border-gray-200 hover:border-main-cl rounded-lg p-2.5 transition-all duration-200 hover:shadow-md active:scale-[0.98]`}
                  data-is-picked={fontFamily === currentTextFont}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="5xl:text-[0.8em] text-xs font-bold text-white bg-main-cl group-hover:bg-secondary-cl rounded px-1.5 py-0.5 transition-colors">
                        {index + 1}
                      </span>
                      <span className="5xl:text-[0.8em] text-xs font-semibold text-gray-700 group-hover:text-main-cl transition-colors">
                        {fontFamily}
                      </span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400 group-hover:text-main-cl transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                  <div
                    className="5xl:text-[1em] text-lg text-gray-800 group-hover:text-gray-900 leading-tight"
                    style={{ fontFamily }}
                  >
                    Xin chào! Đây là {fontFamily}
                  </div>
                </div>
              ))}

              {filteredFonts.length === 0 && searchKeyword && (
                <div className="text-center py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto text-gray-300 mb-2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <p className="text-gray-500 text-sm font-medium">Không tìm thấy font nào</p>
                  <p className="text-gray-400 text-xs mt-1">Thử từ khóa khác</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
