import { TBaseProduct, TPrintedImage } from '@/utils/types/global'
import { ProductGallery } from './ProductGallery'
import { ProductDetails } from './product/ProductDetails'
import { Customization } from './customize/Customization'
import { LivePreview } from './live-preview/LivePreview'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { useEffect } from 'react'
import { useEditedElementStore } from '@/stores/element/element.store'
import { AdditionalInformation } from './product/AdditionalInformation'
import { Actions } from './Actions'
import { useFontLoader } from '@/hooks/use-font'

const AddingToCartLoadingModal = () => {
  const isLoading = useProductUIDataStore((s) => s.isAddingToCart)
  return (
    isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-999 animate-pop-in p-4">
        <div className="bg-black/50 absolute inset-0 z-10"></div>
        <video autoPlay loop muted playsInline className="z-20 relative">
          <source src="/videos/add-to-cart-loading.webm" type="video/webm" />
        </video>
      </div>
    )
  )
}

type TEditPageProps = {
  products: TBaseProduct[]
  printedImages: TPrintedImage[]
}

export default function EditPage({ products, printedImages }: TEditPageProps) {
  const pickedProduct = useProductUIDataStore((s) => s.pickedProduct)
  const pickedSurface = useProductUIDataStore((s) => s.pickedSurface)
  const pickedVariant = useProductUIDataStore((s) => s.pickedVariant)
  const cancelSelectingElement = useEditedElementStore((s) => s.cancelSelectingElement)
  const { loadAllFonts } = useFontLoader()

  useEffect(() => {
    const listenClickOnPage = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (target) {
        if (
          !(
            target.closest('.NAME-root-element') ||
            target.closest('.NAME-menu-section') ||
            target.closest('.NAME-text-font-picker') ||
            target.closest('.NAME-color-picker-modal') ||
            target.closest('.NAME-template-frame') ||
            target.closest('.NAME-crop-element-modal') ||
            target.closest('.NAME-printed-images-modal') ||
            target.closest('.NAME-remove-printed-element-modal') ||
            target.closest('.NAME-element-interaction-title')
          )
        ) {
          cancelSelectingElement()
        }
      }
    }
    loadAllFonts()
    document.body.addEventListener('click', listenClickOnPage)
    return () => {
      document.body.removeEventListener('click', listenClickOnPage)
    }
  }, [])

  return (
    <div className="font-sans grid grid-cols-[1fr_6fr] h-screen gap-4 bg-white z-10 relative">
      <AddingToCartLoadingModal />
      <ProductGallery products={products} printedImages={printedImages} />
      <div className="NAME-main-parent grid grid-cols-[3fr_2fr] gap-4 h-screen">
        {pickedProduct && pickedVariant && pickedSurface ? (
          <LivePreview
            pickedProduct={pickedProduct}
            editedVariantId={pickedVariant.id}
            editedPrintSurfaceId={pickedSurface.id}
          />
        ) : (
          <div></div>
        )}
        <div className="flex flex-col gap-2 p-4 pl-2 min-h-full max-h-full overflow-y-auto gallery-scroll border border-gray-400/30">
          {pickedProduct && pickedVariant ? (
            <>
              <ProductDetails pickedProduct={pickedProduct} pickedVariant={pickedVariant} />
              <Customization printedImages={printedImages} />
              <Actions />
              <AdditionalInformation productDescription={pickedProduct.description} />
            </>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  )
}
