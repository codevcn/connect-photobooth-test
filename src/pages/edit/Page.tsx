import {
  TBaseProduct,
  TMockupData,
  TPrintedImage,
  TProductVariantInCart,
} from '@/utils/types/global'
import { ProductGallery } from './ProductGallery'
import { ProductDetails } from './product/ProductDetails'
import { Customization } from './customize/Customization'
import { LivePreview } from './live-preview/LivePreview'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { useEffect, useRef } from 'react'
import { useEditedElementStore } from '@/stores/element/element.store'
import { AdditionalInformation } from './product/AdditionalInformation'
import { Actions } from './Actions'
import { useFontLoader } from '@/hooks/use-font'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { useTemplateStore } from '@/stores/ui/template.store'
import { useSearchParams } from 'react-router-dom'
import { useProductStore } from '@/stores/product/product.store'
import { LocalStorageHelper } from '@/utils/localstorage'
import { TemplateFrameMenu } from './customize/template/TemplateFrameMenu'
import { StickerElementMenu } from './elements/sticker-element/Menu'
import { TextElementMenu } from './elements/text-element/Menu'
import { PrintedImageElementMenu } from './elements/printed-image/Menu'
import { cancelSelectingZoomingImages } from './helpers'
import { toast } from 'react-toastify'
import { useKeyboardStore } from '@/stores/keyboard/keyboard.store'

const TemplateFrameMenuResponsive = () => {
  const selectedElement = useEditedElementStore((s) => s.selectedElement)
  const { elementId, elementType, elementURL } = selectedElement || {}
  const cancelSelectingElement = useEditedElementStore((s) => s.cancelSelectingElement)

  return (
    elementId && (
      <div className="smd:hidden block">
        {elementType === 'template-frame' && elementURL ? (
          <TemplateFrameMenu
            frameId={elementId}
            onClose={cancelSelectingElement}
            printedImageURL={elementURL}
          />
        ) : elementType === 'sticker' ? (
          <StickerElementMenu elementId={elementId} onClose={cancelSelectingElement} />
        ) : elementType === 'printed-image' ? (
          <PrintedImageElementMenu elementId={elementId} onClose={cancelSelectingElement} />
        ) : (
          <TextElementMenu elementId={elementId} onClose={cancelSelectingElement} />
        )}
      </div>
    )
  )
}

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

/**
 * Restore mockup visual states từ localStorage
 */
const restoreMockupVisualStates = (mockupId: string) => {
  const savedMockup = LocalStorageHelper.getSavedMockupData()
  if (!savedMockup) return

  const cartItems = savedMockup.productsInCart
  let foundMockup: TMockupData | null = null
  let foundProductVariant: TProductVariantInCart | null = null
  let foundProductId: TBaseProduct['id'] | null = null

  // Search for the mockup in all cart items
  for (const item of cartItems) {
    for (const variant of item.productVariants) {
      for (const mockupData of variant.mockupDataList) {
        if (mockupData.id === mockupId) {
          foundMockup = mockupData
          foundProductVariant = variant
          foundProductId = item.productId
          break
        }
      }
    }
  }
  console.log('>>> [reto] ko tim thay:', {
    foundMockup,
    foundProductVariant,
    foundProductId,
  })

  if (!foundMockup || !foundProductVariant || !foundProductId) return

  useEditedElementStore.getState().resetData()

  setTimeout(() => {
    // Restore text elements
    const restoredTextElements = foundMockup.elementsVisualState.texts || []
    console.log('>>> [reto] texts:', restoredTextElements)
    if (restoredTextElements.length > 0) {
      useEditedElementStore
        .getState()
        .setTextElements(restoredTextElements.map((text) => ({ ...text, isFromSaved: true })))
    }

    // Restore printed image elements
    const restoredPrintedImageElements = foundMockup.elementsVisualState.printedImages || []
    console.log('>>> [reto] printedImages:', restoredPrintedImageElements)
    if (restoredPrintedImageElements.length > 0) {
      useEditedElementStore.getState().setPrintedImageElements(
        restoredPrintedImageElements.map((printedImage) => ({
          ...printedImage,
          isFromSaved: true,
        }))
      )
    }

    // Restore sticker elements
    const restoredStickerElements = foundMockup.elementsVisualState.stickers || []
    console.log('>>> [reto] stickers:', restoredStickerElements)
    if (restoredStickerElements.length > 0) {
      useEditedElementStore
        .getState()
        .setStickerElements(
          restoredStickerElements.map((sticker) => ({ ...sticker, isFromSaved: true }))
        )
    }

    // Restore product, variant, surface, and template
    const product = useProductStore.getState().getProductById(foundProductId)
    console.log('>>> [reto] product 86:', product)
    if (!product) return
    const variantId = foundProductVariant.variantId
    const variant = product.variants.find((v) => v.id === variantId)
    console.log('>>> [reto] variant:', variant)
    if (!variant) return
    const surface = product.printAreaList.find((s) => s.id === foundMockup.surfaceInfo.id)
    console.log('>>> [reto] surface:', surface)
    if (!surface) return
    const storedTemplates = foundMockup.elementsVisualState.storedTemplates || []
    console.log('>>> [reto] storedTemplates:', storedTemplates)
    useProductUIDataStore
      .getState()
      .handlePickProductOnRestore(product, storedTemplates[0], variant, surface)
  }, 0)
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
  const mockupId = useSearchParams()[0].get('mockupId')
  const firstRenderRef = useRef(true)

  useEffect(() => {
    const listenPointerDownOnPage = (e: PointerEvent) => {
      const target = e.target
      if (target instanceof Element) {
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
            target.closest('.NAME-element-interaction-title') ||
            target.closest('.NAME-element-interactive-buttons')
          )
        ) {
          cancelSelectingElement()
        }
        if (!target.closest('.NAME-zoom-placed-image-btn-wrapper')) {
          cancelSelectingZoomingImages()
        }
        if (
          !target.closest('.NAME-vietnamese-virtual-keyboard') &&
          !target.classList.contains('hg-button')
        ) {
          useKeyboardStore.getState().hideKeyboard()
        }
      }
    }

    const listenWindowResize = () => {
      cancelSelectingElement()
      cancelSelectingZoomingImages()
    }

    const listenWindowScroll = () => {
      cancelSelectingElement()
      cancelSelectingZoomingImages()
    }

    if (mockupId && firstRenderRef.current) {
      restoreMockupVisualStates(mockupId)
      firstRenderRef.current = false
    }

    loadAllFonts()
    document.body.addEventListener('pointerdown', listenPointerDownOnPage)
    window.addEventListener('resize', listenWindowResize)
    window.addEventListener('scroll', listenWindowScroll)
    return () => {
      document.body.removeEventListener('pointerdown', listenPointerDownOnPage)
      window.removeEventListener('resize', listenWindowResize)
      window.removeEventListener('scroll', listenWindowScroll)
      useEditedElementStore.getState().resetData()
      useElementLayerStore.getState().resetData()
      useProductUIDataStore.getState().resetData()
      useTemplateStore.getState().resetData()
    }
  }, [])

  return (
    <div className="NAME-edit-page-root spmd:grid-cols-[1fr_6fr] xl:gap-4 smd:grid-rows-[1fr_6fr] grid-cols-1 font-sans grid h-screen bg-white z-10 relative">
      <AddingToCartLoadingModal />
      <ProductGallery products={products} printedImages={printedImages} />
      <div className="NAME-main-parent xl:gap-4 spmd:h-screen spmd:min-h-auto md:grid-cols-[3fr_2fr] smd:grid-cols-[3fr_2.5fr] smd:min-h-0 smd:w-auto w-full grid-cols-1 grid gap-2">
        {pickedProduct && pickedVariant && pickedSurface ? (
          <LivePreview
            pickedProduct={pickedProduct}
            editedVariantId={pickedVariant.id}
            pickedSurfaceId={pickedSurface.id}
            printedImages={printedImages}
          />
        ) : (
          <div></div>
        )}
        <TemplateFrameMenuResponsive />
        <div className="xl:px-3 xl:pt-4 smd:gap-2 px-2 pt-1 pb-4 flex flex-col pl-2 h-full overflow-y-auto gallery-scroll border border-gray-400/30">
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
