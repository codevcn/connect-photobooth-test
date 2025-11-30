import { TPrintedImage } from '@/utils/types/global'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { TemplateFrameMenu } from '../customize/template/TemplateFrameMenu'
import { useEditedElementStore } from '@/stores/element/element.store'
import { generateUniqueId, getNaturalSizeOfImage } from '@/utils/helpers'
import { createInitialConstants } from '@/utils/contants'
import { PrintedImagesModal } from './PrintedImagesModal'

type ImageProps = {
  img: TPrintedImage
  imgsContainerRef: React.RefObject<HTMLDivElement | null>
  onClickImage: (printedImg: TPrintedImage) => void
}

const Image = ({ img, imgsContainerRef, onClickImage }: ImageProps) => {
  const { url, id } = img

  const handleClickImage = () => {
    onClickImage({ ...img, id, url })
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
        }
      },
      (err) => {}
    )
  }, [url])

  return (
    <div
      onClick={handleClickImage}
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

type PrintedImageProps = {
  printedImage: TPrintedImage
  onClose: () => void
}

const PrintedImagePreviewModal = ({ printedImage, onClose }: PrintedImageProps) => {
  const imgsContainerRef = useRef<HTMLDivElement>(null)

  const handleAddImageToPrintArea = (printedImg: TPrintedImage) => {
    useEditedElementStore.getState().addPrintedImageElements([
      {
        id: generateUniqueId(),
        path: printedImg.url,
        position: {
          x: createInitialConstants<number>('ELEMENT_X'),
          y: createInitialConstants<number>('ELEMENT_Y'),
        },
        angle: createInitialConstants<number>('ELEMENT_ROTATION'),
        scale: createInitialConstants<number>('ELEMENT_ZOOM'),
        zindex: createInitialConstants<number>('ELEMENT_ZINDEX'),
        mountType: 'from-new',
      },
    ])
    onClose()
  }

  return (
    <div className="NAME-printed-images-modal fixed inset-0 z-999 flex items-center justify-center">
      <div onClick={onClose} className="bg-black/70 absolute inset-0 z-10"></div>
      <div className="relative z-20 bg-white w-full max-w-[90vw] rounded-lg max-h-[90vh] flex flex-col transition duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-b-gray-200 shadow">
          <h2 className="text-lg font-bold">Ảnh của bạn</h2>
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
          <p className="text-gray-700 text-sm text-center w-full mb-2 font-medium">
            Nhấn vào ảnh để thêm vào khu vực in
          </p>
          <Image
            img={printedImage}
            imgsContainerRef={imgsContainerRef}
            onClickImage={handleAddImageToPrintArea}
          />
        </div>
      </div>
    </div>
  )
}

type PrintedImageForTemplateProps = {
  printedImages: TPrintedImage[]
}

const PrintedImagesForTemplate = ({ printedImages }: PrintedImageForTemplateProps) => {
  const cancelSelectingElement = useEditedElementStore((s) => s.cancelSelectingElement)
  const selectedElement = useEditedElementStore((s) => s.selectedElement)
  const { elementId, elementType, elementURL } = selectedElement || {}
  // const containerRef = useRef<HTMLDivElement>(null)
  const [pickedImage, setPickedImage] = useState<TPrintedImage>()

  const scrollToSelectedElement = () => {
    if (elementType !== 'template-frame') return
    if (window.innerWidth < 662) {
      document.body
        .querySelector('.NAME-print-area-container')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      document.body
        .querySelector('.NAME-menu-template-frame')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleSelectElement = () => {
    // nếu không phải frame và màn hình đang có kích thước nhỏ hơn smd thì ẩn container
    // if (elementType && elementType !== 'template-frame' && window.innerWidth < 662) {
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

  useEffect(() => {
    scrollToSelectedElement()
  }, [elementId, elementType, elementURL])

  return (
    <div className="w-full">
      <h3 className="smd:text-base text-xs mb-1 font-bold text-gray-800">
        Chọn ảnh <span className="smd:inline hidden">chụp photobooth</span>
      </h3>
      <div className="flex flex-wrap gap-1 items-center overflow-x-auto gallery-scroll w-full">
        {printedImages.length > 0 &&
          printedImages.map((printedImage, index) => (
            <div key={printedImage.id} onClick={() => setPickedImage(printedImage)}>
              <img
                className={`${
                  index === 0 ? 'aspect-video' : 'aspect-square'
                } h-12 border border-gray-300 object-contain mobile-touch`}
                src={printedImage.url}
                alt="Ảnh chụp photobooth"
              />
            </div>
          ))}

        {pickedImage &&
          createPortal(
            <PrintedImagePreviewModal
              onClose={() => setPickedImage(undefined)}
              printedImage={pickedImage}
            />,
            document.body
          )}
      </div>

      {elementId && elementType === 'template-frame' && elementURL && (
        <div className="smd:block hidden w-full">
          <TemplateFrameMenu
            frameId={elementId}
            onClose={cancelSelectingElement}
            printedImageURL={elementURL}
          />
        </div>
      )}
    </div>
  )
}

type TPrintedImagesPreviewProps = {
  printedImages: TPrintedImage[]
}

export const PrintedImagesPreview = ({ printedImages }: TPrintedImagesPreviewProps) => {
  return (
    <div className="smd:mt-6 col-span-2 mt-2 flex-1 flex gap-2 justify-between">
      <PrintedImagesForTemplate printedImages={printedImages} />
      <PrintedImagesModal printedImages={printedImages} />
    </div>
  )
}
