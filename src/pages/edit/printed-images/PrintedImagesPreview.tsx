import { TPrintedImage } from '@/utils/types/global'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { TemplateFrameMenu } from '../customize/template/TemplateFrameMenu'
import { useEditedElementStore } from '@/stores/element/element.store'
import { generateUniqueId, getNaturalSizeOfImage } from '@/utils/helpers'
import { createInitialConstants } from '@/utils/contants'
import { PrintedImagesModal } from './PrintedImagesModal'
import { CustomScrollbar } from '@/components/custom/CustomScrollbar'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { useEditAreaStore } from '@/stores/ui/edit-area.store'
import { calculateInitialImageElementPosition } from '../elements/helpers'

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
        className="smd:max-h-[calc(100vh-135px)] max-h-[calc(100vh-200px)] max-w-full group-hover:scale-105 transition-transform duration-200 object-contain"
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
    const elementId = generateUniqueId()
    getNaturalSizeOfImage(
      printedImg.url,
      (width, height) => {
        const scaleFactor = useEditAreaStore.getState().editAreaScaleValue
        const elementRect = calculateInitialImageElementPosition(
          { height, width },
          scaleFactor,
          'printed-image'
        )
        useEditedElementStore.getState().addPrintedImageElements([
          {
            id: elementId,
            path: printedImg.url,
            position: {
              x: elementRect.x,
              y: elementRect.y,
            },
            angle: createInitialConstants<number>('ELEMENT_ROTATION'),
            scale: createInitialConstants<number>('ELEMENT_ZOOM'),
            zindex: createInitialConstants<number>('ELEMENT_ZINDEX'),
            mountType: 'from-new',
            height: elementRect.height,
            width: elementRect.width,
          },
        ])
        useElementLayerStore.getState().addElementLayers([
          {
            elementId,
            elementType: 'printed-image',
            index: createInitialConstants<number>('ELEMENT_ZINDEX'),
          },
        ])
        useEditedElementStore.getState().selectElement(elementId, 'printed-image', printedImg.url)
        onClose()
      },
      (error) => {}
    )
  }

  return (
    <div className="NAME-printed-images-modal fixed inset-0 z-999 flex items-center justify-center">
      <div onClick={onClose} className="bg-black/70 absolute inset-0 z-10"></div>
      <div className="relative z-20 bg-white w-fit max-w-[90vw] rounded-lg max-h-[95vh] flex flex-col transition duration-300 ease-in-out">
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
        <div className="flex flex-col items-center flex-1 overflow-y-auto p-3">
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
    // if (elementType !== 'template-frame') return
    // if (window.innerWidth < 662) {
    //   document.body
    //     .querySelector('.NAME-print-area-container')
    //     ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // } else {
    //   document.body
    //     .querySelector('.NAME-menu-template-frame')
    //     ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // }
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
    <div className="5xl:text-[1.5em] w-full text-[1em]">
      <h3 className="5xl:text-[1em] smd:text-sm text-xs font-bold text-gray-800">
        Thêm ảnh vào vùng in
      </h3>
      <CustomScrollbar
        classNames={{
          container: 'w-full pb-1',
          content:
            'flex flex-nowrap gap-3 py-1.5 pl-1.5 items-center overflow-x-auto gallery-scroll w-full',
        }}
      >
        {printedImages.length > 0 &&
          printedImages.map((printedImage, index) => (
            <div
              className="shadow-[0_0_10px_rgba(0,0,0,0.3)] mobile-touch rounded-md relative"
              key={printedImage.id}
              onClick={() => setPickedImage(printedImage)}
            >
              <div className="bg-gray-100 z-40 rounded px-1 text-[10px] text-gray-600 absolute top-1 right-1 shadow-md">
                {index + 1}
                <span>/</span>
                {printedImages.length}
              </div>
              <img
                className={`${
                  index === 0 ? 'aspect-video' : 'aspect-square'
                } 5xl:h-20 h-12 min-w-12 object-contain mobile-touch`}
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
      </CustomScrollbar>

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
    <div className="col-span-2 mt-2 flex-1 flex gap-2 justify-between">
      <PrintedImagesForTemplate printedImages={printedImages} />
      <PrintedImagesModal printedImages={printedImages} />
    </div>
  )
}
