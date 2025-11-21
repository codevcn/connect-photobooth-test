import { usePrintArea } from '@/hooks/use-print-area'
import { TBaseProduct } from '@/utils/types/global'
import { useEffect, useMemo } from 'react'
import { PrintAreaOverlay } from './PrintAreaOverlay'
import { hardCodedPrintTemplates } from '@/configs/data/print-template'

type TDisplayedImage = {
  surfaceId: TBaseProduct['printAreaList'][number]['id']
  variantId: TBaseProduct['variants'][number]['id']
  imageURL: string
  altText: string
}

type TLivePreviewProps = {
  pickedProduct: TBaseProduct
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

  const { printAreaRef, printAreaContainerRef } = usePrintArea(printAreaInfo)

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

  return (
    <div
      ref={printAreaContainerRef}
      className="NAME-main-img min-h-full max-h-full w-full h-full overflow-hidden bg-gray-100 border border-gray-400/30 relative"
    >
      <img
        src={displayedImage.imageURL}
        alt={displayedImage.altText}
        crossOrigin="anonymous"
        className="NAME-product-image min-h-full max-h-full w-full h-full object-contain relative z-4"
      />
      <PrintAreaOverlay
        printTemplate={hardCodedPrintTemplates('1-square')}
        printAreaRef={printAreaRef}
        isOutOfBounds={false}
      />
    </div>
  )
}
