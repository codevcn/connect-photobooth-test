import { useEffect, useRef, useState } from 'react'
import { useHtmlToCanvas } from '@/hooks/use-html-to-canvas'
import { cleanPrintAreaOnExtractMockupImage } from './helpers'

type TMockupPreviewProps = {
  onClose: () => void
}

export const MockupPreview = ({ onClose }: TMockupPreviewProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const urlToRevokeRef = useRef<string | null>(null)
  const { saveHtmlAsImage } = useHtmlToCanvas()
  const previewImageRef = useRef<HTMLImageElement>(null)
  const previewImageContainerRef = useRef<HTMLDivElement>(null)

  /**
   * Tạo preview bằng cách capture screenshot của print area
   * Sử dụng modern-screenshot để có chất lượng cao
   */
  const generatePreview = () => {
    setIsLoading(true)
    setError(null)
    const previewImage = previewImageRef.current
    if (!previewImage) return
    previewImage.src = ''
    const previewImageContainer = previewImageContainerRef.current
    if (!previewImageContainer) return
    previewImageContainer.style.setProperty('display', 'none')

    if (urlToRevokeRef.current) {
      URL.revokeObjectURL(urlToRevokeRef.current)
      urlToRevokeRef.current = null
    }

    const container = document.body.querySelector<HTMLDivElement>('.NAME-print-area-container')
    if (!container) {
      return setError('Không tìm thấy khu vực chỉnh sửa')
    }
    const { removeMockPrintArea, printAreaContainer } =
      cleanPrintAreaOnExtractMockupImage(container)
    if (!printAreaContainer) {
      return setError('Không tìm thấy khu vực in trên sản phẩm')
    }
    saveHtmlAsImage(
      printAreaContainer,
      'image/png',
      4,
      (imageData) => {
        setTimeout(() => {
          removeMockPrintArea()
          urlToRevokeRef.current = URL.createObjectURL(imageData)
          previewImage.src = urlToRevokeRef.current
          previewImageContainer.style.setProperty('display', 'flex')
          setIsLoading(false)
        }, 100)
      },
      (error) => {
        setError('Không thể tạo bản xem trước. Vui lòng thử lại.')
      }
    )
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      generatePreview()
    })
    return () => {
      // Revoke URL khi component unmount hoặc khi tạo preview mới
      if (urlToRevokeRef.current) {
        URL.revokeObjectURL(urlToRevokeRef.current)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-99 animate-pop-in p-4">
      <div onClick={onClose} className="bg-black/50 absolute inset-0 z-10"></div>
      <div className="relative z-20 flex flex-col bg-white rounded-lg shadow-2xl max-w-[95vw] overflow-hidden animate-pop-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-1 border-b border-gray-200 bg-main-cl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
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
              className="lucide lucide-eye"
            >
              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Xem trước bản mockup
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 active:scale-95 transition-all text-white cursor-pointer"
            aria-label="Đóng"
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
              className="lucide lucide-x"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          {isLoading && (
            <div className="flex flex-col items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-loader w-12 h-12 text-main-cl animate-spin"
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
              <p className="text-gray-600 font-medium">Đang tạo bản xem trước...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-alert-circle text-red-500"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={generatePreview}
                className="px-4 py-2 bg-main-cl text-white rounded-lg hover:bg-main-hover-cl transition-colors font-medium"
              >
                Thử lại
              </button>
            </div>
          )}

          <div
            ref={previewImageContainerRef}
            className="max-w-full max-h-full items-center justify-center hidden"
          >
            <img
              ref={previewImageRef}
              src={undefined}
              alt="Mockup preview"
              className="w-full h-[calc(98vh-60px)] object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
