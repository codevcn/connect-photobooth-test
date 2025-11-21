import { TBaseProduct, TPrintAreaInfo, TPrintedImage, TPrintTemplate } from '@/utils/types/global'
import { PrintAreaOverlayPreview } from './live-preview/PrintAreaOverlay'
import { usePrintArea } from '@/hooks/use-print-area'
import { usePrintedImageStore } from '@/stores/printed-image/printed-image.store'
import { initTheBestTemplateForPrintedImages } from './helpers'
import { useEffect, useMemo } from 'react'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'

type TProductProps = {
  product: TBaseProduct
  printAreaInfo: TPrintAreaInfo
  printedImages: TPrintedImage[]
  onPickProduct: (product: TBaseProduct, initialTemplate: TPrintTemplate) => void
  initFirstProduct: (prod: TBaseProduct, initialTemplate: TPrintTemplate) => void
  isPicked: boolean
}

const Product = ({
  product,
  printAreaInfo,
  printedImages,
  onPickProduct,
  initFirstProduct,
  isPicked,
}: TProductProps) => {
  const { printAreaRef, printAreaContainerRef } = usePrintArea(printAreaInfo)

  const initialTemplate = useMemo(() => {
    const printArea = printAreaInfo.area
    return initTheBestTemplateForPrintedImages(
      {
        height: printArea.printH,
        width: printArea.printW,
      },
      printedImages
    )
  }, [printAreaInfo, printedImages])

  useEffect(() => {
    initFirstProduct(product, initialTemplate)
  }, [])

  return (
    <div
      key={product.id}
      ref={printAreaContainerRef}
      className={`${
        isPicked ? 'outline-2 outline-main-cl' : 'outline-0'
      } w-full cursor-pointer mobile-touch outline-0 hover:outline-2 hover:outline-main-cl aspect-square relative rounded-xl transition-transform duration-200 border border-gray-200`}
      data-url={product.url}
      onClick={() => onPickProduct(product, initialTemplate)}
    >
      <img
        src={product.url || '/images/placeholder.svg'}
        alt={product.name}
        className="NAME-product-image min-h-full max-h-full w-full h-full object-contain rounded-xl"
      />
      <PrintAreaOverlayPreview printTemplate={initialTemplate} printAreaRef={printAreaRef} />
    </div>
  )
}

type TProductGalleryProps = {
  products: TBaseProduct[]
  printedImages: TPrintedImage[]
  onPickProduct: (product: TBaseProduct, initialTemplate: TPrintTemplate) => void
}

export const ProductGallery = ({ products, onPickProduct }: TProductGalleryProps) => {
  const printedImages = usePrintedImageStore((s) => s.printedImages)
  const initFirstProduct = useProductUIDataStore((s) => s.initFirstProduct)
  const pickedProduct = useProductUIDataStore((s) => s.pickedProduct)

  return (
    <div className="md:h-screen h-fit flex flex-col bg-white py-3 border border-gray-200">
      <h2 className="text-base w-full text-center font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
        Gian hàng sản phẩm
      </h2>
      <div className="overflow-y-auto px-1.5">
        <div className="flex md:flex-col md:items-center gap-3 overflow-x-scroll p-2 pt-3 md:overflow-y-auto md:overflow-x-clip h-fit md:max-h-full spmd:max-h-full gallery-scroll">
          {products &&
            products.length > 0 &&
            products.map((product) => {
              return (
                <Product
                  key={product.id}
                  product={product}
                  printAreaInfo={product.printAreaList[0]}
                  printedImages={printedImages}
                  onPickProduct={onPickProduct}
                  initFirstProduct={initFirstProduct}
                  isPicked={product.id === pickedProduct?.id}
                />
              )
            })}
        </div>
      </div>
    </div>
  )
}
