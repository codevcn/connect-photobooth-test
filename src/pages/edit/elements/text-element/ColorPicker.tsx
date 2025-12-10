import { useDebouncedCallback } from '@/hooks/use-debounce'
import { ETextFieldNameForKeyBoard } from '@/providers/GlobalKeyboardProvider'
import { useEditedElementStore } from '@/stores/element/element.store'
import { detectColorFormat, getContrastColor, rgbStringToHex } from '@/utils/helpers'
import { TTextVisualState } from '@/utils/types/global'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

// Bảng màu cơ bản cho text editor
const BASIC_COLORS = [
  // Row 1 - Reds & Pinks
  { hex: '#000000', name: 'Đen' },
  { hex: '#FFFFFF', name: 'Trắng' },
  { hex: '#FF0000', name: 'Đỏ' },
  { hex: '#FF69B4', name: 'Hồng' },
  { hex: '#FF1493', name: 'Hồng đậm' },
  { hex: '#C71585', name: 'Tím hồng' },

  // Row 2 - Oranges & Yellows
  { hex: '#FF4500', name: 'Cam đỏ' },
  { hex: '#FF8C00', name: 'Cam đậm' },
  { hex: '#FFA500', name: 'Cam' },
  { hex: '#FFD700', name: 'Vàng kim' },
  { hex: '#FFFF00', name: 'Vàng' },
  { hex: '#F0E68C', name: 'Vàng nhạt' },

  // Row 3 - Greens
  { hex: '#ADFF2F', name: 'Xanh vàng' },
  { hex: '#7FFF00', name: 'Xanh chanh' },
  { hex: '#00FF00', name: 'Xanh lá' },
  { hex: '#32CD32', name: 'Xanh lá đậm' },
  { hex: '#228B22', name: 'Xanh rừng' },
  { hex: '#006400', name: 'Xanh đậm' },

  // Row 4 - Cyans & Blues
  { hex: '#00FFFF', name: 'Cyan' },
  { hex: '#00CED1', name: 'Xanh ngọc' },
  { hex: '#1E90FF', name: 'Xanh dương' },
  { hex: '#0000FF', name: 'Xanh blue' },
  { hex: '#4169E1', name: 'Xanh hoàng gia' },
  { hex: '#000080', name: 'Xanh navy' },

  // Row 5 - Purples & Browns
  { hex: '#8A2BE2', name: 'Tím blue' },
  { hex: '#9370DB', name: 'Tím nhạt' },
  { hex: '#800080', name: 'Tím' },
  { hex: '#A0522D', name: 'Nâu đất' },
  { hex: '#8B4513', name: 'Nâu yên' },
  { hex: '#654321', name: 'Nâu đậm' },

  // Row 6 - Grays
  { hex: '#F5F5F5', name: 'Xám sáng' },
  { hex: '#D3D3D3', name: 'Xám nhạt' },
  { hex: '#A9A9A9', name: 'Xám' },
  { hex: '#808080', name: 'Xám đậm' },
  { hex: '#696969', name: 'Xám tối' },
  { hex: '#2F4F4F', name: 'Xám đen' },
]

export const initColorOnShow = (setCurrentColor: (color: string) => void) => {
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
    let color = (JSON.parse(dataVisualState) as TTextVisualState).textColor
    if (color && detectColorFormat(color) === 'rgb') {
      color = rgbStringToHex(color) || ''
      if (!color) {
        return
      }
    }
    setCurrentColor(color)
  })
}

type ColorPickerModalProps = {
  onHideShow: (show: boolean) => void
  onColorChange: (color: string) => void
  inputText: string
  currentColor: string
  setCurrentColor: (color: string) => void
}

export const ColorPickerModal = ({
  onHideShow,
  onColorChange,
  inputText,
  currentColor,
  setCurrentColor,
}: ColorPickerModalProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleColorSelect = (color: string) => {
    setCurrentColor(color)
    onColorChange(color)
  }

  const handleInputChange = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    if (detectColorFormat(value) === 'rgb') {
      // Convert sang hex để UI hiểu được
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

  useEffect(() => {
    initColorOnShow(setCurrentColor)
  }, [])

  return (
    <div className="NAME-color-picker-modal 5xl:text-3xl fixed inset-0 flex items-center justify-center z-99 animate-pop-in p-4">
      <div onClick={() => onHideShow(false)} className="bg-black/50 absolute inset-0 z-10"></div>
      <div className="bg-white rounded-2xl p-4 w-full max-w-md shadow-2xl max-h-[95vh] overflow-y-auto relative z-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="5xl:text-[1.2em] text-lg font-bold text-gray-800">Chọn màu chữ</h3>
          <button
            onClick={() => onHideShow(false)}
            className="text-gray-800 hover:bg-gray-100 active:scale-90 w-8 h-8 5xl:w-12 5xl:h-12 flex items-center justify-center rounded-full transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x-icon lucide-x w-5 h-5 5xl:w-8 5xl:h-8"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Current Color Display */}
        <div className="mb-4">
          <label className="5xl:text-[0.8em] block text-sm font-semibold text-gray-700 mb-2">
            Xem trước màu chữ:
          </label>
          <div
            style={{
              backgroundColor: getContrastColor(currentColor),
            }}
            className="w-full bg-gray-50 rounded-xl border-2 border-gray-300 p-4 text-center"
          >
            <p className="5xl:text-4xl text-3xl font-bold" style={{ color: currentColor }}>
              {inputText}
            </p>
          </div>
        </div>

        {/* Color Palette Grid */}
        <div className="mb-4">
          <label className="5xl:text-[0.8em] block text-sm font-semibold text-gray-700 mb-2">
            Chọn màu nhanh:
          </label>
          <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
            {BASIC_COLORS.map((color) => {
              const isSelected = currentColor.toUpperCase() === color.hex.toUpperCase()
              return (
                <button
                  key={color.hex}
                  onClick={() => handleColorSelect(color.hex)}
                  title={color.name}
                  className={`aspect-square rounded-lg transition-all hover:scale-110 active:scale-95 ${
                    isSelected
                      ? 'ring-4 ring-main-cl ring-offset-2 scale-110'
                      : 'hover:ring-2 hover:ring-gray-400'
                  } ${color.hex === '#FFFFFF' ? 'border-2 border-gray-300' : ''}`}
                  style={{
                    backgroundColor: color.hex,
                  }}
                >
                  {isSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={
                        color.hex === '#FFFFFF' ||
                        color.hex === '#F5F5F5' ||
                        color.hex === '#FFFF00'
                          ? '#000000'
                          : '#FFFFFF'
                      }
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-full h-full p-1"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Input Color */}
        <div className="mb-4">
          <label className="5xl:text-[0.8em] block text-sm font-semibold text-gray-800 mb-2">
            Hoặc nhập mã màu:
          </label>
          <input
            type="text"
            ref={inputRef}
            value={currentColor}
            onChange={handleInputChange}
            placeholder="Ví dụ: red, pink, #fe6e87"
            className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} 5xl:text-[0.9em] w-full px-3 text-gray-800 py-2.5 border-gray-300 border-2 rounded-lg focus:border-main-cl focus:ring-2 focus:ring-main-cl/20 outline-none transition-all`}
          />
        </div>

        {/* Footer */}
        <div className="text-center">
          <button
            onClick={() => onHideShow(false)}
            className="bg-main-cl hover:bg-dark-main-cl mobile-touch text-white font-bold px-6 py-3 rounded-xl transition w-full text-base 5xl:text-xl"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  )
}
