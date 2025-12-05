import { TBaseProduct, TPrintAreaInfo, TPrintedImage, TPrintTemplate } from '@/utils/types/global'
import { PrintAreaOverlayPreview } from './live-preview/PrintAreaOverlay'
import { usePrintArea } from '@/hooks/use-print-area'
import { usePrintedImageStore } from '@/stores/printed-image/printed-image.store'
import { initTheBestTemplateForPrintedImages } from './helpers'
import { use, useEffect, useRef, useState } from 'react'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { useTemplateStore } from '@/stores/ui/template.store'
import { useSearchParams } from 'react-router-dom'

type TProductProps = {
  product: TBaseProduct
  initialTemplate: TPrintTemplate
  firstPrintAreaInProduct: TPrintAreaInfo
  onPickProduct: (
    product: TBaseProduct,
    initialTemplate: TPrintTemplate,
    firstPrintAreaInProduct: TPrintAreaInfo
  ) => void
  onInitTemplates: (initialTemplate: TPrintTemplate) => void
  isPicked: boolean
  onInitFirstProduct: (
    product: TBaseProduct,
    initialTemplate: TPrintTemplate,
    firstPrintAreaInProduct: TPrintAreaInfo
  ) => void
}

const Product = ({
  product,
  initialTemplate,
  onPickProduct,
  onInitTemplates,
  isPicked,
  onInitFirstProduct,
  firstPrintAreaInProduct,
}: TProductProps) => {
  const firstPrintArea = product.printAreaList[0]
  const { printAreaRef, printAreaContainerRef } = usePrintArea(firstPrintArea)

  useEffect(() => {
    onInitTemplates(initialTemplate)
    onInitFirstProduct(product, initialTemplate, firstPrintAreaInProduct)
  }, [])

  return (
    <div
      ref={printAreaContainerRef}
      data-product-id={product.id}
      data-is-picked={isPicked}
      className={`${
        isPicked ? 'outline-2 outline-main-cl' : 'outline-0'
      } NAME-gallery-product spmd:w-full spmd:h-auto h-[100px] aspect-square cursor-pointer mobile-touch outline-0 hover:outline-2 hover:outline-main-cl relative rounded-xl transition-transform duration-200 border border-gray-200`}
      onClick={() => onPickProduct(product, initialTemplate, firstPrintAreaInProduct)}
    >
      <img
        src={firstPrintArea.imageUrl || '/images/placeholder.svg'}
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
  const [firstProduct, setFirstProduct] = useState<[TBaseProduct, TPrintTemplate, TPrintAreaInfo]>()
  const hasPickedProduct = useRef(false)

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
    if (!mockupId) {
      if (allTemplates.length > 0 && firstProduct && firstProduct.length === 3) {
        useProductUIDataStore
          .getState()
          .handlePickFirstProduct(firstProduct[0], firstProduct[1], firstProduct[2])
      }
    }
  }

  const handleSetFirstProduct = (
    firstProductInList: TBaseProduct,
    initialTemplate: TPrintTemplate,
    initialSurface: TPrintAreaInfo
  ) => {
    if (!firstProduct && !hasPickedProduct.current) {
      hasPickedProduct.current = true
      setFirstProduct([firstProductInList, initialTemplate, initialSurface])
    }
  }

  useEffect(() => {
    initFirstProduct()
  }, [allTemplates.length, firstProduct?.length])

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
      <h2 className="5xl:text-[1.3em] text-[1em] py-2 w-full text-center font-bold text-gray-800 flex items-center justify-center gap-2">
        Gian hàng sản phẩm
      </h2>
      <div className="NAME-products-gallery spmd:overflow-y-auto spmd:max-h-full spmd:flex-col smpd:px-1.5 px-3 py-2 overflow-x-auto gallery-scroll w-full h-fit flex items-center gap-3">
        {products &&
          products.length > 0 &&
          products.map((product) => {
            const firstPrintArea = product.printAreaList[0]
            return (
              <Product
                key={product.id}
                product={product}
                firstPrintAreaInProduct={firstPrintArea}
                initialTemplate={initTheBestTemplateForPrintedImages(
                  {
                    height: firstPrintArea.area.printH,
                    width: firstPrintArea.area.printW,
                  },
                  printedImages
                )}
                onPickProduct={handlePickProduct}
                onInitTemplates={(initialTemplate) => handleInitTemplate(initialTemplate)}
                isPicked={product.id === pickedProduct?.id}
                onInitFirstProduct={handleSetFirstProduct}
              />
            )
          })}
      </div>
    </div>
  )
}
