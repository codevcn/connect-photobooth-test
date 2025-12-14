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
    <div className="fixed inset-0 flex items-center justify-center z-99 p-3 animate-fade-in">
      <div onClick={onClose} className="bg-black/60 absolute inset-0 z-10"></div>
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl relative z-20 overflow-hidden border-2 border-main-cl">
        {/* Header */}
        <div className="bg-main-cl px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <div className="w-7 h-7 5xl:w-9 5xl:h-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-white 5xl:w-6 5xl:h-6"
              >
                <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
              </svg>
            </div> */}
            <h3 className="text-base 5xl:text-2xl font-bold text-white">
              Hướng dẫn tạo ảnh in đẹp
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 5xl:w-9 5xl:h-9 hover:bg-white/20 active:bg-white/30 rounded-lg transition flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-white 5xl:w-7 5xl:h-7"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="5xl:text-[1.2em] px-3 py-2 max-h-[82vh] overflow-y-auto">
          <div className="space-y-1.5">
            {/* Step 1 */}
            <div className="flex gap-2.5 p-2 rounded-lg hover:shadow-sm transition">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-sm 5xl:text-lg mb-0.5 flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-main-cl 5xl:w-5 5xl:h-5"
                  >
                    <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                    <path
                      fillRule="evenodd"
                      d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Chọn mẫu in
                </h4>
                <p className="text-xs 5xl:text-base leading-snug text-gray-600">
                  Chọn layout phù hợp (1-6 ảnh). Nhấn vào ảnh để mở danh sách, sau đó chọn ảnh cho
                  từng khung.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-2.5 p-2 rounded-lg hover:shadow-sm transition">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-sm 5xl:text-lg mb-0.5 flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-main-cl 5xl:w-5 5xl:h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Thêm nhãn dán
                </h4>
                <p className="text-xs 5xl:text-base leading-snug text-gray-600">
                  Chọn sticker yêu thích để trang trí, di chuyển, xoay và phóng to/thu nhỏ tùy ý.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-2.5 p-2 rounded-lg hover:shadow-sm transition">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-sm 5xl:text-lg mb-0.5 flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-main-cl 5xl:w-5 5xl:h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 003 3h15a3 3 0 01-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125zM12 9.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H12zm-.75-2.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H12a.75.75 0 01-.75-.75zM6 12.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H6zm-.75 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zM6 6.75a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3A.75.75 0 009 6.75H6z"
                      clipRule="evenodd"
                    />
                    <path d="M18.75 6.75h1.875c.621 0 1.125.504 1.125 1.125V18a1.5 1.5 0 01-3 0V6.75z" />
                  </svg>
                  Thêm văn bản
                </h4>
                <p className="text-xs 5xl:text-base leading-snug text-gray-600">
                  Nhập text (tên, lời chúc...), chọn font chữ, màu sắc và điều chỉnh vị trí.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-2.5 p-2 rounded-lg hover:shadow-sm transition">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-sm 5xl:text-lg mb-0.5 flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-main-cl 5xl:w-5 5xl:h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Xem trước và hoàn tất
                </h4>
                <p className="text-xs 5xl:text-base leading-snug text-gray-600">
                  Nhấn <span className="font-semibold text-main-cl">"Xem trước bản mockup"</span> để
                  kiểm tra trước khi thêm vào giỏ hàng.
                </p>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 5xl:w-6 5xl:h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-amber-900 text-xs 5xl:text-base mb-0.5">
                  Lưu ý quan trọng
                </p>
                <p className="text-xs 5xl:text-sm text-amber-800 leading-snug">
                  Hình xem trước có thể khác sản phẩm thực tế về màu sắc do ánh sáng và màn hình.
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
      {showModal &&
        createPortal(<InstructionsModal onClose={() => setShowModal(false)} />, document.body)}
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
