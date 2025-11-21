import { getNaturalSizeOfImage } from '@/utils/helpers'
import { TPrintedImage, TSizeInfo } from '@/utils/types/global'
import { useEffect, useRef } from 'react'

type ImageProps = {
  img: TPrintedImage
  imgsContainerRef: React.RefObject<HTMLDivElement | null>
  onAddImage: (printedImg: TPrintedImage, imgSize: TSizeInfo) => void
}

const Image = ({ img, imgsContainerRef, onAddImage }: ImageProps) => {
  const { url, id } = img
  const imgDataRef = useRef<TSizeInfo>(null)

  const handleAddImage = () => {
    if (imgDataRef.current) {
      onAddImage({ ...img, id, url }, imgDataRef.current)
    }
  }

  useEffect(() => {
    getNaturalSizeOfImage(
      url,
      (width, height) => {
        const imgEle = imgsContainerRef.current?.querySelector<HTMLDivElement>(
          `.NAME-printed-image-box[data-img-box-id='${id}'] img`
        )
        if (imgEle) {
          imgEle.style.cssText = `width: ${width}px; aspect-ratio: ${width} / ${height};`
          imgDataRef.current = { width, height }
        }
      },
      (err) => {}
    )
  }, [url])

  return (
    <div
      onClick={handleAddImage}
      className="NAME-printed-image-box cursor-pointer relative w-fit h-fit rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-colors group"
      data-img-box-id={id}
    >
      <img
        src={url || '/images/placeholder.svg'}
        alt={`Printed Image`}
        className="max-w-full group-hover:scale-105 transition-transform duration-200 object-contain"
      />
    </div>
  )
}

type PrintedImagesProps = {
  onAddImage: (printedImg: TPrintedImage, imgSize: TSizeInfo) => void
  printedImages: TPrintedImage[]
  onClose: () => void
}

export const PrintedImagesModal = ({ onAddImage, printedImages, onClose }: PrintedImagesProps) => {
  const imgsContainerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center">
      <div onClick={onClose} className="bg-black/70 absolute inset-0 z-10"></div>
      <div className="relative z-20 bg-white w-full max-w-[90vw] rounded-lg max-h-[90vh] flex flex-col transition duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-b-gray-200 shadow">
          <h2 className="text-lg font-bold">Chọn ảnh bạn đã chụp</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors cursor-pointer mobile-touch"
            aria-label="Close"
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
              className="lucide lucide-x-icon lucide-x"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-2" ref={imgsContainerRef}>
            {printedImages.map((img) => (
              <Image
                key={img.id}
                img={img}
                imgsContainerRef={imgsContainerRef}
                onAddImage={onAddImage}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
