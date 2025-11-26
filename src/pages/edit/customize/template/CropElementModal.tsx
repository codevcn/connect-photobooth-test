import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { TUserInputImage } from '@/utils/types/global'
import { toast } from 'react-toastify'
import { SectionLoading } from '@/components/custom/Loading'
import { useImageCrop } from '@/hooks/use-image-crop'

type CropElementModalProps = {
  imageUrl: string
  elementId: string
  onCropComplete: (elementId: string, croppedImageUrl: string) => void
  onClose: () => void
}

enum EInputNames {
  CUSTOM_WIDTH = 'custom-width',
  CUSTOM_HEIGHT = 'custom-height',
}

export const CropElementModal = ({
  imageUrl,
  elementId,
  onCropComplete,
  onClose,
}: CropElementModalProps) => {
  const inputsContainerRef = useRef<HTMLDivElement>(null)
  const cropModalContainerRef = useRef<HTMLDivElement>(null)
  const [rotatedImageUrl, setRotatedImageUrl] = useState<string | null>(null)
  const [maxCropSizeHeight, setMaxCropSizeHeight] = useState<number>(0)

  // Create imageData for the hook
  const imageData = useMemo<TUserInputImage | undefined>(() => {
    if (!imageUrl) return undefined
    return {
      url: imageUrl,
      blob: new Blob(), // Dummy blob, not used in crop logic
    }
  }, [imageUrl])

  // Use the image crop hook
  const {
    crop,
    completedCrop,
    isCropping,
    customWidth,
    customHeight,
    minCropSizeWidth,
    minCropSizeHeight,
    imgRef,
    handleCropChange,
    handleCropComplete,
    onImageLoad,
    updateCropWidth,
    updateCropHeight,
    executeCrop,
  } = useImageCrop({
    imageData,
    onCropComplete: (croppedImage, error) => {
      if (error) {
        console.error('>>> Crop error:', error)
        toast.error('Không thể cắt ảnh')
      } else if (croppedImage) {
        // Call parent callback with cropped image URL
        onCropComplete(elementId, croppedImage.url)
        onClose()
      }
    },
  })

  const handleCrop = useCallback(async () => {
    try {
      await executeCrop()
    } catch (error) {
      console.error('>>> Crop error:', error)
      toast.error('Không thể cắt ảnh')
    }
  }, [executeCrop])

  const handleWidthChange = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const width = parseFloat(value)
    if (isNaN(width)) return
    updateCropWidth(width)
  }, 300)

  const handleHeightChange = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const height = parseFloat(value)
    if (isNaN(height)) return
    updateCropHeight(height)
  }, 300)

  const rotateImageIfNeeded = useCallback((imageUrl: string) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      toast.info(
        'Đang xử lý ảnh..., ' +
          window.innerWidth +
          ', ' +
          img.naturalWidth +
          'x' +
          img.naturalHeight,
        {}
      )
      // Chỉ xoay nếu màn hình nhỏ hơn 662px và ảnh ngang
      if (window.innerWidth < 662 && img.naturalWidth > img.naturalHeight * 1.5) {
        // Ảnh ngang cần xoay 90 độ
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Đảo kích thước canvas
        canvas.width = img.naturalHeight
        canvas.height = img.naturalWidth

        // Xoay và vẽ ảnh
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(-Math.PI / 2)
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const rotatedUrl = URL.createObjectURL(blob)
              setRotatedImageUrl(rotatedUrl)
            }
          },
          'image/jpeg',
          0.95
        )
      } else {
        // Không cần xoay
        const rotateImgContainer = document.body.querySelector<HTMLElement>(
          '.NAME-rotate-image-container'
        )
        rotateImgContainer?.style.setProperty('flex-direction', 'column')
        rotateImgContainer?.style.setProperty('align-items', 'center')
        rotateImgContainer
          ?.querySelector<HTMLElement>('.NAME-sub-rotate-image-container')
          ?.style.setProperty('height', 'fit-content')
        setMaxCropSizeHeight(250)
        rotateImgContainer
          ?.querySelector<HTMLElement>('.NAME-sub-image-crop')
          ?.style.setProperty('height', 'fit-content')
        rotateImgContainer
          ?.querySelector<HTMLElement>('.NAME-sub-form-image-edit')
          ?.style.setProperty('width', '100%')
        setRotatedImageUrl(imageUrl)
      }
    }
    img.src = imageUrl
  }, [])

  const adjustUIBasedOnImage = () => {
    requestAnimationFrame(() => {
      if (imageUrl) {
        rotateImageIfNeeded(imageUrl)
      } else {
        setRotatedImageUrl(null)
      }
    })
  }

  useEffect(() => {
    if (customWidth < minCropSizeWidth || customHeight < minCropSizeHeight) return
    for (const input of inputsContainerRef.current?.querySelectorAll<HTMLInputElement>('input') ||
      []) {
      if (input.name === EInputNames.CUSTOM_WIDTH) {
        input.value = `${customWidth}`
      } else if (input.name === EInputNames.CUSTOM_HEIGHT) {
        input.value = `${customHeight}`
      }
    }
  }, [customWidth, customHeight, minCropSizeWidth, minCropSizeHeight])

  useEffect(() => {
    adjustUIBasedOnImage()
    if (imageUrl) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [imageUrl])

  useEffect(() => {
    // Cập nhật kích thước crop tối đa khi cửa sổ thay đổi kích thước
    const updateMaxCropSize = () => {
      requestAnimationFrame(() => {
        setMaxCropSizeHeight(window.innerHeight * 0.9 - 32) // trừ đi padding
      })
    }
    updateMaxCropSize()
    window.addEventListener('resize', updateMaxCropSize)
    return () => {
      window.removeEventListener('resize', updateMaxCropSize)
    }
  }, [])

  return (
    <div
      ref={cropModalContainerRef}
      className="NAME-crop-element-modal fixed inset-0 flex items-center justify-center z-999"
    >
      <div className="absolute inset-0 bg-black/50 z-10" onClick={onClose}></div>
      <div className="relative z-20 w-full max-w-5xl">
        <div className="NAME-rotate-image-container flex gap-2.5 items-stretch max-h-[90vh] pr-2 bg-gray-100 rounded-lg px-6 py-4 overflow-y-auto overflow-x-hidden w-full">
          <div className="NAME-sub-rotate-image-container flex items-center justify-center w-2/3 max-w-2/3 h-[calc(90vh-32px)]">
            <div className="NAME-sub-image-crop flex items-start justify-center w-full h-full overflow-hidden">
              {rotatedImageUrl ? (
                <ReactCrop
                  crop={crop}
                  onChange={handleCropChange}
                  onComplete={handleCropComplete}
                  minWidth={minCropSizeWidth}
                  minHeight={minCropSizeHeight}
                >
                  <img
                    ref={imgRef}
                    alt="Ảnh để crop"
                    src={rotatedImageUrl}
                    onLoad={onImageLoad}
                    className="NAME-root-crop-image object-contain max-h-full max-w-full"
                    style={{ maxHeight: maxCropSizeHeight }}
                    crossOrigin="anonymous"
                  />
                </ReactCrop>
              ) : (
                <SectionLoading
                  classNames={{
                    container: 'w-fit h-full',
                  }}
                  message="Đang tải ảnh..."
                />
              )}
            </div>
          </div>

          <div className="NAME-sub-form-image-edit min-w-[200px] flex flex-col items-stretch w-1/3 max-h-[calc(90vh-0px)] overflow-y-auto p-3 bg-white rounded-lg text-gray-600">
            <div className="p-2 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-800">Kích thước vùng cắt</h3>
              <div ref={inputsContainerRef} className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-xs text-gray-800 mb-1">Chiều rộng (px)</label>
                  <input
                    type="number"
                    onChange={handleWidthChange}
                    className="xs:py-1 w-full px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    min="50"
                    step="1"
                    name={EInputNames.CUSTOM_WIDTH}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-800 mb-1">Chiều cao (px)</label>
                  <input
                    type="number"
                    onChange={handleHeightChange}
                    className="xs:py-1 w-full px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    min="50"
                    step="1"
                    name={EInputNames.CUSTOM_HEIGHT}
                  />
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4">
              <div className="flex gap-y-2 gap-x-2 flex-col">
                <button
                  className="w-full h-8 rounded text-white bg-gray-400 font-bold cursor-pointer hover:bg-gray-500 transition-colors disabled:opacity-50"
                  onClick={onClose}
                  disabled={isCropping}
                >
                  Hủy
                </button>
                <button
                  className="flex items-center justify-center gap-2 w-full h-8 rounded cursor-pointer bg-main-cl text-white font-bold active:scale-90 transition-colors disabled:opacity-50"
                  onClick={handleCrop}
                  disabled={!completedCrop || isCropping}
                >
                  {isCropping ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-loader-icon lucide-loader animate-spin"
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
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="6"
                          y="6"
                          width="12"
                          height="12"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M6 6L3 3M18 6L21 3M6 18L3 21M18 18L21 21"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>Cắt và lưu</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
