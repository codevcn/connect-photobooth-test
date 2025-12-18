import { EInternalEvents, eventEmitter } from '@/utils/events'
import { checkIfMobileScreen, getNaturalSizeOfImage } from '@/utils/helpers'
import { TPrintedImage } from '@/utils/types/global'
import { useEffect, useRef, useState } from 'react'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { useLayoutStore } from '@/stores/ui/print-layout.store'
import { createPortal } from 'react-dom'
import { CropImageElementModal } from '../../elements/CropImageElementModal'
import { useQueryFilter } from '@/hooks/extensions'
import { toast } from 'react-toastify'

type ImageProps = {
  img: TPrintedImage
  imgsContainerRef: React.RefObject<HTMLDivElement | null>
  onClickImage: (printedImg: TPrintedImage) => void
}

const ImageSlot = ({ img, imgsContainerRef, onClickImage }: ImageProps) => {
  const { url, id } = img

  const handleClickImage = () => {
    onClickImage({ ...img, id, url })
  }

  useEffect(() => {
    setTimeout(() => {
      getNaturalSizeOfImage(
        url,
        (width, height) => {
          const imgEle = imgsContainerRef.current?.querySelector<HTMLImageElement>(
            `.NAME-printed-image-box[data-img-box-id='${id}'] img`
          )
          if (imgEle) {
            imgEle.style.cssText = `width: ${width}px; aspect-ratio: ${width} / ${height};`
            imgEle.src = url
          }
        },
        (err) => {}
      )
    }, 0)
  }, [url, id])

  return (
    <div
      onClick={handleClickImage}
      className="NAME-printed-image-box cursor-pointer relative w-fit h-fit rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-colors group"
      data-img-box-id={id}
    >
      <img
        src={undefined}
        alt={`Printed Image`}
        className="max-w-full group-hover:scale-105 transition-transform duration-200 object-contain"
      />
    </div>
  )
}

type TDataOnOpen = {
  slotId?: string
  layoutId?: string
}

type TCropImageModalData = {
  printdImage?: TPrintedImage
  showModal: boolean
}

type PrintedImagesProps = {
  printedImages: TPrintedImage[]
}

export const PrintedImagesModal = ({ printedImages }: PrintedImagesProps) => {
  const imgsContainerRef = useRef<HTMLDivElement>(null)
  const dataOnOpenRef = useRef<TDataOnOpen>({
    slotId: undefined,
    layoutId: undefined,
  })
  const [showPrintedImagesModal, setShowPrintedImagesModal] = useState(false)
  const [showCropImageModal, setShowCropImageModal] = useState<TCropImageModalData>({
    printdImage: undefined,
    showModal: false,
  })
  const queryFilter = useQueryFilter()

  const handleAddPrintedImageToLayout = (printedImg: TPrintedImage) => {
    const pickedPrintSurface = useProductUIDataStore.getState().pickedSurface
    if (!pickedPrintSurface) return
    const { slotId, layoutId } = dataOnOpenRef.current
    if (!slotId || !layoutId) return
    useLayoutStore.getState().addPlacedImageToLayout(layoutId, slotId, printedImg)
    setShowPrintedImagesModal(false)
  }

  const addPrintedImageToLayout = (printedImage: TPrintedImage) => {
    const pickedPrintSurface = useProductUIDataStore.getState().pickedSurface
    if (!pickedPrintSurface) return
    const { slotId, layoutId } = dataOnOpenRef.current
    if (!slotId || !layoutId) return
    useLayoutStore.getState().addPlacedImageToLayout(layoutId, slotId, printedImage)
    setShowPrintedImagesModal(false)
  }

  const handleCropPrintedImageComplete = (imageBlob: Blob) => {
    const printedImage = showCropImageModal.printdImage
    if (!printedImage) return
    const clonedImage = { ...printedImage }
    clonedImage.url = URL.createObjectURL(imageBlob)
    if (!clonedImage) return
    addPrintedImageToLayout(clonedImage)
  }

  const handleNoCropPrintedImage = () => {
    const printedImage = showCropImageModal.printdImage
    if (!printedImage) return
    addPrintedImageToLayout(printedImage)
  }

  const listenHideShowPrintedImagesModal = (show: boolean, slotId?: string, layoutId?: string) => {
    dataOnOpenRef.current = { slotId, layoutId }
    setShowPrintedImagesModal(show)
  }

  const handlePickPrintedImage = (printedImg: TPrintedImage) => {
    toast.info(
      'ptm: ' +
        queryFilter.isPhotoism +
        ' , dev: ' +
        queryFilter.dev +
        ' , fun:' +
        queryFilter.funId
    )
    if (queryFilter.isPhotoism || queryFilter.dev) {
      handleShowCropImageModal(printedImg)
    } else {
      handleAddPrintedImageToLayout(printedImg)
    }
  }

  const handleShowCropImageModal = (printedImg: TPrintedImage) => {
    setShowCropImageModal({ printdImage: printedImg, showModal: true })
  }
  const handleCloseCropImageModal = () => {
    setShowCropImageModal({ printdImage: undefined, showModal: false })
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

  return (
    <>
      <div
        style={{
          display: showPrintedImagesModal ? 'flex' : 'none',
        }}
        className="NAME-printed-images-modal 5xl:text-3xl fixed inset-0 z-999 flex items-center justify-center"
      >
        <div
          onClick={() => setShowPrintedImagesModal(false)}
          className="bg-black/70 absolute inset-0 z-10"
        ></div>
        <div className="relative z-20 bg-white w-full max-w-[90vw] rounded-lg max-h-[80vh] flex flex-col transition duration-300 ease-in-out">
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
                <ImageSlot
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

      {!checkIfMobileScreen() &&
        showCropImageModal.showModal &&
        showCropImageModal.printdImage &&
        createPortal(
          <CropImageElementModal
            elementId={showCropImageModal.printdImage.id}
            imageUrl={showCropImageModal.printdImage.url}
            onClose={handleCloseCropImageModal}
            onCropComplete={handleCropPrintedImageComplete}
            showNoCrop
            onNoCrop={handleNoCropPrintedImage}
          />,
          document.body
        )}
    </>
  )
}
