import { TBaseProduct, TPrintedImage, TPrintTemplate } from '@/utils/types/global'
import { PrintAreaOverlayPreview } from './live-preview/PrintAreaOverlay'
import { usePrintArea } from '@/hooks/use-print-area'
import { usePrintedImageStore } from '@/stores/printed-image/printed-image.store'
import { initTheBestTemplateForPrintedImages } from './helpers'
import { useEffect } from 'react'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { useTemplateStore } from '@/stores/ui/template.store'
import { useSearchParams } from 'react-router-dom'

type TProductProps = {
  product: TBaseProduct
  initialTemplate: TPrintTemplate
  onPickProduct: (product: TBaseProduct, initialTemplate: TPrintTemplate) => void
  onInitTemplates: (initialTemplate: TPrintTemplate) => void
  isPicked: boolean
}

const Product = ({
  product,
  initialTemplate,
  onPickProduct,
  onInitTemplates,
  isPicked,
}: TProductProps) => {
  const { printAreaRef, printAreaContainerRef } = usePrintArea(product.printAreaList[0])

  useEffect(() => {
    onInitTemplates(initialTemplate)
  }, [])

  return (
    <div
      ref={printAreaContainerRef}
      data-product-id={product.id}
      data-is-picked={isPicked}
      className={`${
        isPicked ? 'outline-2 outline-main-cl' : 'outline-0'
      } NAME-gallery-product spmd:w-full spmd:h-auto h-[100px] aspect-square cursor-pointer mobile-touch outline-0 hover:outline-2 hover:outline-main-cl relative rounded-xl transition-transform duration-200 border border-gray-200`}
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
}

export const ProductGallery = ({ products }: TProductGalleryProps) => {
  const printedImages = usePrintedImageStore((s) => s.printedImages)
  const pickedProduct = useProductUIDataStore((s) => s.pickedProduct)
  const handlePickProduct = useProductUIDataStore((s) => s.handlePickProduct)
  const initializeAddingTemplates = useTemplateStore((s) => s.initializeAddingTemplates)
  const allTemplates = useTemplateStore((s) => s.allTemplates)
  const mockupId = useSearchParams()[0].get('mockupId')

  const scrollToPickedProduct = () => {
    if (pickedProduct) {
      const productElement = document.body.querySelector<HTMLElement>(
        `.NAME-gallery-product[data-product-id="${pickedProduct.id}"]`
      )
      if (productElement && productElement.dataset.isPicked === 'true') {
        productElement.scrollIntoView({ behavior: 'instant', block: 'center' })
      }
    }
  }

  const handleInitTemplate = (initialTemplate: TPrintTemplate) => {
    initializeAddingTemplates([initialTemplate])
  }

  const initFirstProduct = () => {
    console.log('>>> [ddd] mockupId at gallery:', mockupId)
    if (!mockupId) {
      if (allTemplates.length > 0) {
        console.log('>>> [ddd] run this init first product')
        handlePickProduct(products[0], allTemplates[0])
      }
    }
  }

  useEffect(() => {
    initFirstProduct()
  }, [allTemplates.length])

  useEffect(() => {
    scrollToPickedProduct()
  }, [pickedProduct?.id])

  // useEffect(() => {
  //   setTimeout(() => {
  //     initPlacedImageStyle('.NAME-products-gallery .NAME-frame-placed-image')
  //   }, 0)
  // }, [products])

  return (
    <div className="spmd:pb-3 spmd:h-screen spmd:w-auto md:text-base text-sm w-full h-fit pb-1 flex flex-col bg-white border border-gray-200">
      <h2 className="text-[1em] py-2 w-full text-center font-bold text-gray-800 flex items-center justify-center gap-2">
        Gian hàng sản phẩm
      </h2>
      <div className="NAME-products-gallery spmd:overflow-y-auto spmd:max-h-full spmd:flex-col smpd:px-1.5 px-3 py-2 overflow-x-auto gallery-scroll w-full h-fit flex items-center gap-3">
        {products &&
          products.length > 0 &&
          products.map((product) => {
            const printArea = product.printAreaList[0].area
            return (
              <Product
                key={product.id}
                product={product}
                initialTemplate={initTheBestTemplateForPrintedImages(
                  {
                    height: printArea.printH,
                    width: printArea.printW,
                  },
                  printedImages
                )}
                onPickProduct={handlePickProduct}
                onInitTemplates={(initialTemplate) => handleInitTemplate(initialTemplate)}
                isPicked={product.id === pickedProduct?.id}
              />
            )
          })}
      </div>
    </div>
  )
}
