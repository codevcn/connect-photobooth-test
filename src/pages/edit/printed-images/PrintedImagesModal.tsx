import { useTemplateStore } from '@/stores/ui/template.store'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { getNaturalSizeOfImage } from '@/utils/helpers'
import { TPrintedImage, TTemplateFrame } from '@/utils/types/global'
import { useEffect, useRef, useState } from 'react'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'

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

type TDataOnOpen = {
  pickedFrameId?: TTemplateFrame['id']
}

type PrintedImagesProps = {
  printedImages: TPrintedImage[]
}

export const PrintedImagesModal = ({ printedImages }: PrintedImagesProps) => {
  const imgsContainerRef = useRef<HTMLDivElement>(null)
  const dataOnOpenRef = useRef<TDataOnOpen>({
    pickedFrameId: undefined,
  })
  const [showPrintedImagesModal, setShowPrintedImagesModal] = useState(false)

  const handleAddPrintedImageToFrame = (printedImg: TPrintedImage) => {
    const pickedPrintSurface = useProductUIDataStore.getState().pickedSurface
    if (!pickedPrintSurface) return
    const { pickedFrameId } = dataOnOpenRef.current
    const printAreaSize = {
      width: pickedPrintSurface.area.printW,
      height: pickedPrintSurface.area.printH,
    }
    useTemplateStore.getState().addImageToFrame(printedImg, printAreaSize, pickedFrameId)
    setShowPrintedImagesModal(false)
  }

  const listenHideShowPrintedImagesModal = (show: boolean, frameId?: TTemplateFrame['id']) => {
    dataOnOpenRef.current = { pickedFrameId: frameId }
    setShowPrintedImagesModal(show)
  }

  const handlePickPrintedImage = (printedImg: TPrintedImage) => {
    handleAddPrintedImageToFrame(printedImg)
  }

  useEffect(() => {
    eventEmitter.on(
      EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL,
      listenHideShowPrintedImagesModal
    )
    return () => {
      eventEmitter.off(
        EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL,
        listenHideShowPrintedImagesModal
      )
    }
  }, [])

  if (!showPrintedImagesModal) return null

  return (
    <div className="NAME-printed-images-modal 5xl:text-3xl fixed inset-0 z-999 flex items-center justify-center">
      <div
        onClick={() => setShowPrintedImagesModal(false)}
        className="bg-black/70 absolute inset-0 z-10"
      ></div>
      <div className="relative z-20 bg-white w-full max-w-[90vw] rounded-lg max-h-[90vh] flex flex-col transition duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-b-gray-200 shadow">
          <h2 className="5xl:text-[1em] text-lg font-bold">Chọn ảnh bạn đã chụp</h2>
          <button
            onClick={() => setShowPrintedImagesModal(false)}
            className="5xl:h-12 5xl:w-12 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors cursor-pointer mobile-touch"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x-icon lucide-x 5xl:w-12 5xl:h-12"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid-cols-1 smd:grid-cols-2 grid gap-2" ref={imgsContainerRef}>
            {printedImages.map((img) => (
              <Image
                key={img.id}
                img={img}
                imgsContainerRef={imgsContainerRef}
                onClickImage={handlePickPrintedImage}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
