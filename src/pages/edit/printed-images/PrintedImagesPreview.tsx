import { TPrintedImage } from '@/utils/types/global'
import { useEffect, useMemo, useRef } from 'react'
import { PrintedImagesModal } from './PrintedImagesModal'
import { createPortal } from 'react-dom'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { TemplateFrameMenu } from '../customize/template/TemplateFrameMenu'
import { useEditedElementStore } from '@/stores/element/element.store'

type TPrintedImagesProps = {
  printedImages: TPrintedImage[]
}

export const PrintedImagesPreview = ({ printedImages }: TPrintedImagesProps) => {
  const cancelSelectingElement = useEditedElementStore((s) => s.cancelSelectingElement)
  const selectedElement = useEditedElementStore((s) => s.selectedElement)
  const { elementId, elementType, elementURL } = selectedElement || {}
  const containerRef = useRef<HTMLDivElement>(null)

  const displayedImage = useMemo<TPrintedImage | null>(() => {
    return printedImages.length > 0 ? printedImages[0] : null
  }, [printedImages])

  const showPrintedImagesModal = () => {
    eventEmitter.emit(EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL, true)
  }

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
    <div ref={containerRef} className="smd:mt-6 col-span-2 mt-2 flex-1">
      <h3 className="smd:text-base text-xs mb-1 font-bold text-gray-800">
        Chọn ảnh <span className="smd:inline hidden">chụp photobooth</span>
      </h3>
      <div className="flex justify-center min-w-[50px] rounded text-main-cl w-fit active:scale-90 transition relative">
        <div onClick={showPrintedImagesModal} className="border-border rounded-md cursor-pointer">
          {displayedImage && (
            <div
              key={displayedImage.id}
              className="h-10 smd:h-[50px] flex items-center overflow-hidden rounded"
            >
              <img
                src={displayedImage.url}
                alt="Printed image"
                className={`h-max w-max max-h-[50px] max-w-20 my-auto object-contain rounded`}
              />
            </div>
          )}
        </div>
        {createPortal(<PrintedImagesModal printedImages={printedImages} />, document.body)}
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
