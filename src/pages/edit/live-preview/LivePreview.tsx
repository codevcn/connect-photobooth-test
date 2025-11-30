import { usePrintArea } from '@/hooks/use-print-area'
import { TBaseProduct, TPosition, TPrintedImage, TPrintAreaInfo } from '@/utils/types/global'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PrintAreaOverlay } from './PrintAreaOverlay'
import { EditedElementsArea } from './EditedElementsArea'
import { AddToCartHandler } from './AddToCartHandler'
import { adjustSizeOfPlacedImageOnPlaced } from './test'
import { adjustNearF3F4F6, getFinalColorValue } from '@/utils/helpers'
import { SectionLoading } from '@/components/custom/Loading'
import { createPortal } from 'react-dom'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { createCommonConstants } from '@/utils/contants'
import { useZoomEditBackground } from '@/hooks/use-zoom-edit-background'
import { tempObject } from '@/stores/temp/temp.store'

type TDisplayedImage = {
  surfaceId: TBaseProduct['printAreaList'][number]['id']
  variantId: TBaseProduct['variants'][number]['id']
  imageURL: string
  altText: string
}

type TLivePreviewProps = {
  pickedProduct: TBaseProduct
  editedVariantId: TBaseProduct['variants'][number]['id']
  pickedSurfaceId: TBaseProduct['printAreaList'][number]['id']
  printedImages: TPrintedImage[]
}

export const LivePreview = ({
  pickedProduct,
  editedVariantId,
  pickedSurfaceId,
  printedImages,
}: TLivePreviewProps) => {
  const printAreaInfo = useMemo(() => {
    return pickedProduct.printAreaList.find((printArea) => printArea.id === pickedSurfaceId)!
  }, [pickedProduct.id, pickedProduct.printAreaList, pickedSurfaceId])
  console.log('>>> [disimg] printAreaInfo:', { printAreaInfo, lis: pickedProduct.printAreaList })
  const { containerRef, scale, position, handlers } = useZoomEditBackground(0.3, 5)

  const { printAreaRef, printAreaContainerRef, checkIfAnyElementOutOfBounds, isOutOfBounds } =
    usePrintArea(printAreaInfo, () => {
      if (!tempObject.firstBackFromCartEdit_allowedPrintAreaChange) {
        setTimeout(() => {
          eventEmitter.emit(EInternalEvents.ELEMENTS_OUT_OF_BOUNDS_CHANGED)
        }, createCommonConstants<number>('ANIMATION_DURATION_PRINT_AREA_BOUNDS_CHANGE') + 100)
      }
      tempObject.firstBackFromCartEdit_allowedPrintAreaChange = false
      adjustSizeOfPlacedImageOnPlaced()
    })

  const displayedImage = useMemo<TDisplayedImage>(() => {
    const variantSurface = pickedProduct.printAreaList.find(
      (variantSurface) =>
        variantSurface.variantId === editedVariantId && variantSurface.id === pickedSurfaceId
    )
    return {
      surfaceId: pickedSurfaceId,
      variantId: editedVariantId,
      imageURL: variantSurface?.imageUrl || pickedProduct.url,
      altText: pickedProduct.name,
    }
  }, [pickedProduct, editedVariantId, pickedSurfaceId])
  console.log('>>> [disimg] displayedImage:', displayedImage)

  const imgURLRef = useRef<string>(displayedImage.imageURL)

  const displayProductChangingModal = (forceShow: boolean = false) => {
    if (!forceShow && imgURLRef.current === displayedImage.imageURL) return
    const modal = document.body.querySelector<HTMLElement>('.NAME-product-changing-modal')
    const maxTimeWait = 6000
    if (modal) {
      modal.style.display = 'flex'
      setTimeout(() => {
        modal.style.display = 'none'
      }, maxTimeWait)
    }
  }

  const removeProductChangingModal = (forceHide: boolean = false) => {
    if (!forceHide && imgURLRef.current === displayedImage.imageURL) return
    imgURLRef.current = displayedImage.imageURL
    const modal = document.body.querySelector<HTMLElement>('.NAME-product-changing-modal')
    if (modal) {
      modal.style.display = 'none'
    }
  }

  useEffect(() => {
    displayProductChangingModal()
    setTimeout(() => {
      removeProductChangingModal()
    }, 6000)
  }, [displayedImage.imageURL])

  useEffect(() => {
    adjustSizeOfPlacedImageOnPlaced()
  }, [])

  return (
    <div
      // ref={containerRef}
      // {...handlers}
      onDragStart={(e) => e.preventDefault()}
      className="smd:w-full overflow-hidden w-full min-h-full h-full relative touch-none"
    >
      {createPortal(
        <div className="bg-blue-600 h-12 w-12 fixed top-0 left-0 z-1000">
          <div>oke</div>
        </div>,
        document.body
      )}
      <AddToCartHandler
        checkIfAnyElementOutOfBounds={checkIfAnyElementOutOfBounds}
        printAreaContainerRef={printAreaContainerRef}
      />
      <div className="NAME-product-changing-modal flex absolute inset-0 z-99 bg-black/30 justify-center items-center">
        <SectionLoading
          message="Đang tải ảnh sản phẩm..."
          classNames={{ shapesContainer: 'text-white', message: 'text-white' }}
        />
      </div>
      <div
        ref={(node) => {
          printAreaContainerRef.current = node
        }}
        className="NAME-print-area-container w-full h-full overflow-hidden bg-gray-100 border z-50 border-gray-400/30 relative"
        style={{
          backgroundColor: adjustNearF3F4F6(getFinalColorValue() || '#ffffff'),
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
      >
        <div
          style={{ display: isOutOfBounds ? 'block' : 'none' }}
          className="NAME-out-of-bounds-overlay-warning absolute inset-0 bg-red-600/20 z-5"
        >
          <p className="absolute top-0 left-0 text-sm text-white font-medium bg-red-600 px-3 py-1 rounded-br-md">
            Ngoài phạm vi in cho phép
          </p>
        </div>
        <img
          src={displayedImage.imageURL}
          alt={displayedImage.altText}
          crossOrigin="anonymous"
          className="NAME-product-image w-full h-full object-contain object-center relative z-4"
          onLoad={() => removeProductChangingModal(true)}
        />
        <PrintAreaOverlay
          printAreaRef={printAreaRef}
          isOutOfBounds={isOutOfBounds}
          displayWarningOverlay
          printedImages={printedImages}
          frameDisplayerOptions={{
            classNames: { container: 'NAME-frames-displayer-print-area' },
          }}
          containerScale={scale}
        />
        <EditedElementsArea
          allowedPrintAreaRef={printAreaRef}
          printAreaContainerRef={printAreaContainerRef}
        />
      </div>
    </div>
  )
}
