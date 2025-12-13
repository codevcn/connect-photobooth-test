import { TPrintedImage } from '@/utils/types/global'
import { PrintedImagesPreview } from '../printed-images/PrintedImagesPreview'
import { StickerMenuWrapper, StickerPicker } from '../elements/sticker-element/StickerPicker'
import { TextEditor, TextMenuWrapper } from '../elements/text-element/TextEditor'
import { PrintedImageMenuWrapper } from '../elements/printed-image/MenuWrapper'
import { LayoutsPicker_Ptm } from './print-layout/LayoutsPicker-Ptm'
import { LayoutsPicker_Fun } from './print-layout/LayoutsPicker-Fun'
import { useState } from 'react'
import { useQueryFilter } from '@/hooks/extensions'
import { createPortal } from 'react-dom'
import { PrintedImagesModal } from './print-layout/PrintedImagesModal'

type TInstructionsModalProps = {
  onClose: () => void
}

const InstructionsModal = ({ onClose }: TInstructionsModalProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-99 p-2 animate-fade-in">
      <div onClick={onClose} className="bg-black/50 absolute inset-0 z-10"></div>
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-20 overflow-hidden">
        {/* Header */}
        <div className="bg-main-cl to-secondary-cl px-4 py-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-white 5xl:w-8 5xl:h-8"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <h3 className="smd:text-lg 5xl:text-3xl text-base font-bold text-white">
              Hướng dẫn tạo ảnh in đẹp
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 active:bg-white/30 rounded-full transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-white 5xl:w-8 5xl:h-8"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="5xl:text-[1.3em] px-4 py-2 max-h-[80vh] overflow-y-auto">
          <div className="space-y-2 text-gray-700">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 5xl:w-10 5xl:h-10 rounded-full bg-main-cl text-white flex items-center justify-center font-bold text-lg 5xl:text-2xl">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-base 5xl:text-xl mb-1">Chọn mẫu in</h4>
                <p className="text-sm 5xl:text-lg leading-relaxed">
                  Lựa chọn layout phù hợp với số lượng ảnh photobooth của bạn (1-4 khung hình). Nhấn
                  vào ảnh photobooth để mở danh sách đầy đủ, sau đó chọn ảnh để cho vào từng khung
                  hình trong mẫu đã chọn.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 5xl:w-10 5xl:h-10 rounded-full bg-main-cl text-white flex items-center justify-center font-bold text-lg 5xl:text-2xl">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-base 5xl:text-xl mb-1">
                  Thêm nhãn dán
                </h4>
                <p className="text-sm 5xl:text-lg leading-relaxed">
                  Chọn sticker yêu thích để trang trí sản phẩm, có thể di chuyển, xoay và phóng
                  to/thu nhỏ tùy ý.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 5xl:w-10 5xl:h-10 rounded-full bg-main-cl text-white flex items-center justify-center font-bold text-lg 5xl:text-2xl">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-base 5xl:text-xl mb-1">Thêm văn bản</h4>
                <p className="text-sm 5xl:text-lg leading-relaxed">
                  Nhập text tùy chỉnh (tên, lời chúc, v.v.), chọn font chữ, màu sắc và điều chỉnh vị
                  trí phù hợp.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 5xl:w-10 5xl:h-10 rounded-full bg-main-cl text-white flex items-center justify-center font-bold text-lg 5xl:text-2xl">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-base 5xl:text-xl mb-1">
                  Xem trước và hoàn tất
                </h4>
                <p className="text-sm 5xl:text-lg leading-relaxed">
                  Hoàn tất thiết kế, nhấn{' '}
                  <span className="font-bold text-main-cl">"Xem trước bản mockup"</span> để kiểm tra
                  trước khi thêm vào giỏ hàng.
                </p>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="mt-2 p-2 bg-orange-50 border-l-4 border-main-cl rounded-lg">
            <div className="flex gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-main-cl shrink-0 mt-0.5 5xl:w-7 5xl:h-7"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
              <div>
                <p className="font-bold text-gray-800 text-sm 5xl:text-lg mb-1">Lưu ý quan trọng</p>
                <p className="text-xs 5xl:text-base text-gray-600 leading-relaxed">
                  Hình ảnh xem trước có thể hơi khác so với sản phẩm thực tế về màu sắc do ánh sáng
                  khi chụp sản phẩm hoặc màn hình thiết bị của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Instructions = () => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="mb-2">
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 text-main-cl hover:text-dark-main-cl text-xs font-medium 5xl:text-lg underline decoration-1 underline-offset-4 transition group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5 5xl:w-6 5xl:h-6 group-hover:scale-110 transition-transform"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          Hướng dẫn chọn ảnh in đẹp
        </button>
      </div>
      {showModal && <InstructionsModal onClose={() => setShowModal(false)} />}
    </>
  )
}

type TCustomizeProps = {
  printedImages: TPrintedImage[]
}

export const Customization = ({ printedImages }: TCustomizeProps) => {
  const queryFilter = useQueryFilter()

  return (
    <div className="NAME-start-of-customization smd:order-2 smd:mt-1 smd:px-3 px-2 py-3 mt-0 order-1 border-border rounded-lg bg-gray-100">
      <Instructions />
      <div className="smd:mt-2 mt-1 relative w-full">
        {queryFilter.isPhotoism ? (
          <LayoutsPicker_Ptm printedImages={printedImages} />
        ) : (
          (queryFilter.funId || queryFilter.dev) && (
            <LayoutsPicker_Fun printedImages={printedImages} />
          )
        )}
        <div className="gap-2 grid grid-cols-1 smd:grid-cols-2 flex-wrap mt-2">
          <PrintedImagesPreview printedImages={printedImages} />
          <div className="smd:hidden flex col-span-2 gap-2">
            <StickerPicker />
            <TextEditor />
          </div>
        </div>
        <PrintedImageMenuWrapper />
        <TextMenuWrapper />
        <StickerMenuWrapper />
      </div>
    </div>
  )
}
