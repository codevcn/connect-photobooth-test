import { useDebouncedCallback } from '@/hooks/use-debounce'
import { useEditedElementStore } from '@/stores/element/element.store'
import { detectColorFormat, rgbStringToHex, rgbToHex } from '@/utils/helpers'
import { TTextVisualState } from '@/utils/types/global'
import { useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { toast } from 'react-toastify'

type ColorPickerModalProps = {
  onHideShow: (show: boolean) => void
  onColorChange: (color: string) => void
  inputText: string
}

export const ColorPickerModal = ({
  onHideShow,
  onColorChange,
  inputText,
}: ColorPickerModalProps) => {
  const [currentColor, setCurrentColor] = useState<string>('#fe6e87')
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleColorPickerChange = (color: string) => {
    setCurrentColor(color)
    onColorChange(color)
  }

  const handleInputChange = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    if (detectColorFormat(value) === 'rgb') {
      // Convert sang hex để HexColorPicker hiểu được
      const hexColor = rgbStringToHex(value)
      if (!hexColor) {
        toast.error('Mã màu không hợp lệ. Vui lòng thử lại.')
        return
      }
      setCurrentColor(hexColor)
      onColorChange(value) // Gửi giá trị gốc (có thể là tên màu)
    } else {
      setCurrentColor(value)
      onColorChange(value)
    }
  }, 300)

  const initColorOnShow = () => {
    requestAnimationFrame(() => {
      const selectedElement = useEditedElementStore.getState().selectedElement
      if (!selectedElement) return
      const dataVisualState = selectedElement.rootElement.getAttribute('data-visual-state')
      if (!dataVisualState) return
      let color = (JSON.parse(dataVisualState) as TTextVisualState).textColor
      if (color && detectColorFormat(color) === 'rgb') {
        color = rgbStringToHex(color) || ''
        if (!color) {
          toast.error('Mã màu không hợp lệ. Vui lòng thử lại.')
          return
        }
      }
      setCurrentColor(color)
    })
  }

  useEffect(() => {
    initColorOnShow()
  }, [])

  return (
    <div className="NAME-color-picker-modal fixed inset-0 flex items-center justify-center z-50 animate-pop-in">
      <div onClick={() => onHideShow(false)} className="bg-black/50 absolute inset-0 z-10"></div>
      <div className="bg-white rounded-lg p-4 w-full mx-4 shadow-2xl max-h-[95vh] overflow-y-auto relative z-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Chọn màu chữ</h3>
          <button
            onClick={() => onHideShow(false)}
            className="text-gray-800 active:scale-90 w-8 h-8 flex items-center justify-center rounded-full transition"
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
              className="lucide lucide-x-icon lucide-x"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Color Picker */}
        <div className="flex justify-center mb-4">
          <HexColorPicker
            style={{ width: '100%' }}
            color={currentColor}
            onChange={handleColorPickerChange}
          />
        </div>

        {/* Current Color Display */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Xem trước màu chữ:
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 rounded-lg border-2 border-gray-300 p-2 text-center">
              <p className="text-3xl font-bold" style={{ color: currentColor }}>
                {inputText}
              </p>
            </div>
          </div>
        </div>

        {/* Input Color */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-800 mb-2">Nhập mã màu:</label>
          <input
            type="text"
            ref={inputRef}
            value={currentColor}
            onChange={handleInputChange}
            placeholder="Nhập tên màu (red / pink / ...) hoặc mã màu hex (#fe6e87)"
            className="w-full px-3 text-gray-800 py-2 border-gray-300 border-2 rounded-lg outline-none transition-all"
          />
        </div>

        {/* Footer */}
        <div className="text-center">
          <button
            onClick={() => onHideShow(false)}
            className="bg-main-cl mobile-touch text-white font-semibold px-6 py-2 rounded-lg transition w-full"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  )
}
