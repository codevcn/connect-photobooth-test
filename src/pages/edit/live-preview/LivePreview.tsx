import { usePrintArea } from '@/hooks/use-print-area'
import { TBaseProduct, TProductWithTemplate } from '@/utils/types/global'
import { useEffect, useMemo, useRef } from 'react'
import { PrintAreaOverlay } from './PrintAreaOverlay'
import { EditedElementsArea } from './EditedElementsArea'
import { AddToCartHandler } from './AddToCartHandler'

type TDisplayedImage = {
  surfaceId: TBaseProduct['printAreaList'][number]['id']
  variantId: TBaseProduct['variants'][number]['id']
  imageURL: string
  altText: string
}

type TLivePreviewProps = {
  pickedProduct: TProductWithTemplate
  editedVariantId: TBaseProduct['variants'][number]['id']
  editedPrintSurfaceId: TBaseProduct['printAreaList'][number]['id']
}

export const LivePreview = ({
  pickedProduct,
  editedVariantId,
  editedPrintSurfaceId,
}: TLivePreviewProps) => {
  const printAreaInfo = useMemo(() => {
    return pickedProduct.printAreaList.find((printArea) => printArea.id === editedPrintSurfaceId)!
  }, [pickedProduct, editedPrintSurfaceId])

  const { printAreaRef, printAreaContainerRef, checkIfAnyElementOutOfBounds, isOutOfBounds } =
    usePrintArea(printAreaInfo)

  const displayedImage = useMemo<TDisplayedImage>(() => {
    const variantSurface = pickedProduct.variantSurfaces.find(
      (variantSurface) =>
        variantSurface.variantId === editedVariantId &&
        variantSurface.surfaceId === editedPrintSurfaceId
    )
    return {
      surfaceId: editedPrintSurfaceId,
      variantId: editedVariantId,
      imageURL: variantSurface?.imageURL || pickedProduct.url,
      altText: pickedProduct.name,
    }
  }, [pickedProduct, editedVariantId, editedPrintSurfaceId])

  const imgURLRef = useRef<string>(displayedImage.imageURL)

  const displayProductChangingModal = () => {
    if (imgURLRef.current === displayedImage.imageURL) return
    const modal = document.body.querySelector<HTMLElement>('.NAME-product-changing-modal')
    const maxTimeWait = 6000
    if (modal) {
      modal.style.display = 'flex'
      setTimeout(() => {
        modal.style.display = 'none'
      }, maxTimeWait)
    }
  }

  const removeProductChangingModal = () => {
    if (imgURLRef.current === displayedImage.imageURL) return
    imgURLRef.current = displayedImage.imageURL
    const modal = document.body.querySelector<HTMLElement>('.NAME-product-changing-modal')
    if (modal) {
      modal.style.display = 'none'
    }
  }

  useEffect(() => {
    displayProductChangingModal()
  }, [displayedImage])

  return (
    <div className="w-full smd:w-full min-h-full h-full relative">
      <AddToCartHandler
        checkIfAnyElementOutOfBounds={checkIfAnyElementOutOfBounds}
        printAreaContainerRef={printAreaContainerRef}
      />
      <div className="NAME-product-changing-modal hidden absolute inset-0 z-99 bg-black/30 justify-center items-center">
        <div className="p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-loader-icon lucide-loader w-16 h-16 text-white animate-spin"
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
        </div>
      </div>
      <div
        ref={printAreaContainerRef}
        className="NAME-print-area-container w-full h-full overflow-hidden bg-gray-100 border z-50 border-gray-400/30 relative"
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
          onLoad={removeProductChangingModal}
        />
        <PrintAreaOverlay
          printAreaRef={printAreaRef}
          isOutOfBounds={isOutOfBounds}
          displayWarningOverlay
        />
        <EditedElementsArea
          allowedPrintAreaRef={printAreaRef}
          printAreaContainerRef={printAreaContainerRef}
        />
      </div>
    </div>
  )
}
