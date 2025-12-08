import { TBaseProduct, TPrintAreaInfo, TPrintedImage } from '@/utils/types/global'
import { PrintAreaOverlay, PrintAreaOverlayPreview } from './live-preview/PrintAreaOverlay'
import { usePrintArea } from '@/hooks/use-print-area'
import { usePrintedImageStore } from '@/stores/printed-image/printed-image.store'
import { useEffect, useState } from 'react'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { useSearchParams } from 'react-router-dom'
import { buildDefaultLayout } from './customize/print-layout/builder'
import { TPrintLayout } from '@/utils/types/print-layout'
import { hardCodedLayoutData } from '@/configs/print-layout/print-layout-data'
import { useLayoutStore } from '@/stores/ui/print-layout.store'
import { PreviewImage } from './customize/print-layout/PreviewImage'
import { createInitialConstants } from '@/utils/contants'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { useEditedElementStore } from '@/stores/element/element.store'

type TProductProps = {
  product: TBaseProduct
  firstPrintAreaInProduct: TPrintAreaInfo
  onPickProduct: (
    product: TBaseProduct,
    initialLayout: TPrintLayout,
    firstPrintAreaInProduct: TPrintAreaInfo
  ) => void
  isPicked: boolean
  onInitFirstProduct: (
    product: TBaseProduct,
    initialLayout: TPrintLayout,
    firstPrintAreaInProduct: TPrintAreaInfo
  ) => void
  printedImages: TPrintedImage[]
}

const Product = ({
  product,
  onPickProduct,
  isPicked,
  onInitFirstProduct,
  firstPrintAreaInProduct,
  printedImages,
}: TProductProps) => {
  const [initialLayout, setInitialLayout] = useState<TPrintLayout>()
  // const previewPrintAreaRef = useRef<HTMLDivElement | null>(null)
  // const previewPrintAreaContainerRef = useRef<HTMLDivElement | null>(null)

  const buildInitialLayout = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!printAreaContainerRef.current || !printAreaRef.current) return
        const { layout } = buildDefaultLayout(
          printAreaContainerRef.current,
          printAreaRef.current,
          printedImages,
          2
        )
        const initialLayout: TPrintLayout = {
          ...hardCodedLayoutData(layout.type)[0],
          printedImageElements: layout.elements,
        }
        setInitialLayout(initialLayout)
        onInitFirstProduct(product, initialLayout, firstPrintAreaInProduct)
      })
    })
  }

  const { printAreaRef, printAreaContainerRef } = usePrintArea(
    firstPrintAreaInProduct,
    buildInitialLayout
  )

  useEffect(() => {
    buildInitialLayout()
  }, [product.id])

  return (
    <div
      ref={(node) => {
        // previewPrintAreaContainerRef.current = node
        printAreaContainerRef.current = node
      }}
      data-product-id={product.id}
      data-is-picked={isPicked}
      className={`${
        isPicked ? 'outline-2 outline-main-cl' : 'outline-0'
      } NAME-gallery-product spmd:w-full spmd:h-auto h-[100px] aspect-square cursor-pointer mobile-touch outline-0 hover:outline-2 hover:outline-main-cl relative rounded-xl border border-gray-200`}
      onClick={() => {
        if (initialLayout) onPickProduct(product, initialLayout, firstPrintAreaInProduct)
      }}
    >
      <img
        src={firstPrintAreaInProduct.imageUrl || '/images/placeholder.svg'}
        alt={product.name}
        className="NAME-product-image min-h-full max-h-full w-full h-full object-contain rounded-xl"
      />
      <PrintAreaOverlayPreview
        registerPrintAreaRef={(node) => {
          printAreaRef.current = node
          // previewPrintAreaRef.current = node
        }}
      />
      {initialLayout?.printedImageElements.map((printedImageVisualState) => (
        <PreviewImage
          key={printedImageVisualState.id}
          printedImageVisualState={printedImageVisualState}
        />
      ))}
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
  const allLayouts = useLayoutStore((s) => s.allLayouts)
  const mockupId = useSearchParams()[0].get('mockupId')
  const [firstProduct, setFirstProduct] = useState<[TBaseProduct, TPrintLayout, TPrintAreaInfo]>()

  const handlePickProduct = (
    product: TBaseProduct,
    initialLayout: TPrintLayout,
    firstPrintAreaInProduct: TPrintAreaInfo
  ) => {
    if (pickedProduct && pickedProduct.id === product.id) return
    useProductUIDataStore
      .getState()
      .handlePickProduct(product, initialLayout, firstPrintAreaInProduct)
    useEditedElementStore.getState().resetData()
    useElementLayerStore.getState().resetData()
  }

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

  const initFirstProduct = () => {
    if (!mockupId) {
      if (allLayouts.length > 0 && firstProduct && firstProduct.length === 3) {
        useProductUIDataStore
          .getState()
          .handlePickFirstProduct(firstProduct[0], firstProduct[1], firstProduct[2])
      }
    }
  }

  const handleSetFirstProduct = (
    firstProductInList: TBaseProduct,
    initialLayout: TPrintLayout,
    initialSurface: TPrintAreaInfo
  ) => {
    if (firstProductInList.id === products[0].id) {
      setFirstProduct([firstProductInList, initialLayout, initialSurface])
    }
  }

  useEffect(() => {
    initFirstProduct()
  }, [allLayouts.length, firstProduct?.length, firstProduct?.map((item) => item.id).join('-')])

  useEffect(() => {
    scrollToPickedProduct()
  }, [pickedProduct?.id])

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
                isPicked={product.id === pickedProduct?.id}
                onPickProduct={handlePickProduct}
                onInitFirstProduct={handleSetFirstProduct}
                printedImages={printedImages}
              />
            )
          })}
      </div>
    </div>
  )
}
