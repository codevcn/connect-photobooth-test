import {
  TBaseProduct,
  TClientProductVariant,
  TElementsVisualState,
  TElementType,
  TPrintAreaInfo,
  TPrintedImage,
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
import { useSearchParams } from 'react-router-dom'
import { useProductStore } from '@/stores/product/product.store'
import { LocalStorageHelper } from '@/utils/localstorage'
import { TemplateFrameMenu } from './customize/template/TemplateFrameMenu'
import { StickerElementMenu } from './elements/sticker-element/Menu'
import { TextElementMenu } from './elements/text-element/Menu'
import { PrintedImageElementMenu } from './elements/printed-image/Menu'
import { cancelSelectingZoomingImages } from './helpers'
import { useKeyboardStore } from '@/stores/keyboard/keyboard.store'
import { useLayoutStore } from '@/stores/ui/print-layout.store'
import { MiddleInfoSection } from './MiddleInfoSection'
import { useQueryFilter } from '@/hooks/extensions'
import { useUserDataStore } from '@/stores/ui/user-data.store'
import { AppLoading } from '@/components/custom/Loading'

const TemplateFrameMenuResponsive = () => {
  const selectedElement = useEditedElementStore((s) => s.selectedElement)
  const { elementId, elementType, elementURL } = selectedElement || {}
  const cancelSelectingElement = useEditedElementStore((s) => s.cancelSelectingElement)
  const mobileScreen = window.innerWidth < 662

  return (
    elementId &&
    mobileScreen && (
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

type TAddingToCartLoadingModalProps = {
  onClose?: () => void
}

const AddingToCartLoadingModal = ({ onClose }: TAddingToCartLoadingModalProps) => {
  const isLoading = useProductUIDataStore((s) => s.isAddingToCart)
  return (
    isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-9999 animate-pop-in p-4">
        <AppLoading
          message="Đang thêm vào giỏ hàng..."
          classNames={{ message: 'text-white', shapesContainer: 'text-white' }}
        />
      </div>
    )
  )
}

/**
 * Restore mockup visual states từ localStorage
 */
const restoreMockupVisualStates = (mockupId?: string) => {
  let elementsVisualState: TElementsVisualState | null = null
  let foundSurfaceId: TPrintAreaInfo['id'] | null = null
  let foundVariantId: TClientProductVariant['id'] | null = null
  let foundProductId: TBaseProduct['id'] | null = null

  if (mockupId) {
    const savedMockup = LocalStorageHelper.getSavedMockupData()
    if (!savedMockup) return

    const cartItems = savedMockup.productsInCart

    // Search for the mockup in all cart items
    for (const item of cartItems) {
      for (const variant of item.productVariants) {
        for (const mockupData of variant.mockupDataList) {
          if (mockupData.id === mockupId) {
            foundSurfaceId = mockupData.surfaceInfo.id
            foundVariantId = variant.variantId
            foundProductId = item.productId
            elementsVisualState = mockupData.elementsVisualState
            break
          }
        }
        if (foundSurfaceId) break
      }
      if (foundSurfaceId) break
    }
  }
  console.log('>>> [reto] ko tim thay:', {
    foundSurfaceId,
    foundVariantId,
    foundProductId,
    elementsVisualState,
    mockupId,
  })

  setTimeout(() => {
    if (elementsVisualState) {
      useEditedElementStore.getState().resetData()

      const layoutMode = elementsVisualState.layoutMode
      console.log('>>> [reto] layoutMode:', layoutMode)
      if (layoutMode) {
        useLayoutStore.getState().setLayoutMode(layoutMode)
      }

      // Restore layout
      const restoredLayout = elementsVisualState.storedLayouts || []
      console.log('>>> [reto] restoredLayout:', restoredLayout)
      if (restoredLayout.length > 0) {
        useLayoutStore.getState().restoreLayout(restoredLayout[0])
      }

      // Restore text elements
      const restoredTextElements = elementsVisualState.texts || []
      console.log('>>> [reto] texts:', restoredTextElements)
      if (restoredTextElements.length > 0) {
        useEditedElementStore.getState().setTextElements(
          restoredTextElements.map((text) => ({
            ...text,
            isFromSaved: true,
            mountType: 'from-saved',
          }))
        )
      }

      // Restore printed image elements
      const restoredPrintedImageElements = elementsVisualState.printedImages || []
      console.log('>>> [reto] printedImages:', restoredPrintedImageElements)
      if (restoredPrintedImageElements.length > 0) {
        useEditedElementStore.getState().setPrintedImageElements(
          restoredPrintedImageElements.map((printedImage) => ({
            ...printedImage,
            isFromSaved: true,
            mountType: 'from-saved',
          }))
        )
      }

      // Restore sticker elements
      const restoredStickerElements = elementsVisualState.stickers || []
      console.log('>>> [reto] stickers:', restoredStickerElements)
      if (restoredStickerElements.length > 0) {
        useEditedElementStore
          .getState()
          .setStickerElements(
            restoredStickerElements.map((sticker) => ({
              ...sticker,
              isFromSaved: true,
              mountType: 'from-saved',
            }))
          )
      }

      useElementLayerStore.getState().resetData()
      useElementLayerStore.getState().addElementLayersOnRestore(
        restoredTextElements
          .map((text) => ({
            elementId: text.id,
            index: text.zindex,
            elementType: 'text' as TElementType,
          }))
          .concat(
            restoredPrintedImageElements.map((printedImage) => ({
              elementId: printedImage.id,
              index: printedImage.zindex,
              elementType: 'printed-image' as TElementType,
              isLayoutImage: printedImage.isInitWithLayout,
            }))
          )
          .concat(
            restoredStickerElements.map((sticker) => ({
              elementId: sticker.id,
              index: sticker.zindex,
              elementType: 'sticker' as TElementType,
            }))
          )
      )
    }

    if (foundVariantId && foundProductId && foundSurfaceId) {
      const product = useProductStore.getState().getProductById(foundProductId)
      console.log('>>> [reto] product 86:', product)
      if (!product) return
      const variant = product.variants.find((v) => v.id === foundVariantId)
      console.log('>>> [reto] variant:', variant)
      if (!variant) return
      const surface = product.printAreaList.find((s) => s.id === foundSurfaceId)
      console.log('>>> [reto] surface:', surface)
      if (!surface) return
      useProductUIDataStore.getState().handlePickProductOnRestore(product, variant, surface)
    }
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
  const queryFilter = useQueryFilter()
  const firstRenderRef = useRef(true)

  const initDeviceId = () => {
    const searchParams = new URLSearchParams(window.location.search)
    const deviceId = searchParams.get('dvid')
    if (!deviceId) return
    useUserDataStore.getState().setDeviceId(deviceId)
  }

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
            target.closest('.NAME-element-interactive-buttons') ||
            target.closest('.NAME-vietnamese-virtual-keyboard')
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
      // cancelSelectingElement()
      cancelSelectingZoomingImages()
    }

    const listenWindowScroll = () => {
      // cancelSelectingElement()
      cancelSelectingZoomingImages()
    }

    if (firstRenderRef.current) {
      restoreMockupVisualStates(mockupId || undefined)
      firstRenderRef.current = false
    }

    initDeviceId()
    loadAllFonts()

    document.body.addEventListener('pointerdown', listenPointerDownOnPage)
    window.addEventListener('resize', listenWindowResize)
    window.addEventListener('scroll', listenWindowScroll)

    return () => {
      document.body.removeEventListener('pointerdown', listenPointerDownOnPage)
      window.removeEventListener('resize', listenWindowResize)
      window.removeEventListener('scroll', listenWindowScroll)
      // useEditedElementStore.getState().resetData()
      // useElementLayerStore.getState().resetData()
      // useProductUIDataStore.getState().resetData()
      // useLayoutStore.getState().resetData()
    }
  }, [])

  return (
    <div
      style={{
        userSelect: queryFilter.funId ? 'auto' : 'none',
      }}
      className="NAME-edit-page-root spmd:grid-cols-[1fr_6fr] xl:gap-4 smd:grid-rows-[1fr_6fr] grid-cols-1 font-sans grid h-screen z-10 relative"
    >
      <AddingToCartLoadingModal />
      <ProductGallery products={products} printedImages={printedImages} />
      {pickedProduct && pickedVariant && (
        <MiddleInfoSection pickedProduct={pickedProduct} pickedVariant={pickedVariant} />
      )}
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
        <div className="xl:px-3 xl:pt-4 smd:gap-2 smd:pb-46 5xl:pb-60 px-2 pt-1 pb-4 relative flex flex-col pl-2 h-full overflow-y-auto gallery-scroll border border-gray-400/30">
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
