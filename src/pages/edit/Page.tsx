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
import { useElementLayerStore } from '@/stores/ui/element-layer.store'

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
    const listenClickOnPage = (e: MouseEvent) => {
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
    
    // Chỉ reset data khi KHÔNG có mockupId (không restore mockup đã lưu)
    const searchParams = new URLSearchParams(window.location.search)
    const mockupId = searchParams.get('mockupId')
    if (!mockupId) {
      useEditedElementStore.getState().resetData()
      useElementLayerStore.getState().resetData()
    }
    
    loadAllFonts()
    document.body.addEventListener('click', listenClickOnPage)
    return () => {
      document.body.removeEventListener('click', listenClickOnPage)
    }
  }, [])

  return (
    <div className="spmd:grid-cols-[1fr_6fr] xl:gap-4 smd:grid-rows-[1fr_6fr] grid-cols-1 font-sans grid h-screen bg-white z-10 relative">
      <AddingToCartLoadingModal />
      <ProductGallery products={products} printedImages={printedImages} />
      <div className="NAME-main-parent xl:gap-4 spmd:h-screen spmd:min-h-auto md:grid-cols-[3fr_2fr] smd:grid-cols-[3fr_2.5fr] smd:min-h-0 smd:w-auto w-full grid-cols-1 grid gap-2">
        {pickedProduct && pickedVariant && pickedSurface ? (
          <LivePreview
            pickedProduct={pickedProduct}
            editedVariantId={pickedVariant.id}
            editedPrintSurfaceId={pickedSurface.id}
          />
        ) : (
          <div></div>
        )}
        <div className="xl:px-3 xl:pt-4 px-2 pt-1 pb-4 flex flex-col gap-2 pl-2 h-full overflow-y-auto gallery-scroll border border-gray-400/30">
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
