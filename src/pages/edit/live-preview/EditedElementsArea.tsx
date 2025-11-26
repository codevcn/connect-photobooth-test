import { useEditedElementStore } from '@/stores/element/element.store'
import { StickerElement } from '../elements/sticker-element/StickerElement'
import { TextElement } from '../elements/text-element/TextElement'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { use, useEffect, useRef } from 'react'
import {
  TBaseProduct,
  TClientProductVariant,
  TMockupData,
  TPrintAreaInfo,
  TPrintedImageVisualState,
  TProductCartInfo,
  TProductSize,
  TProductVariantInCart,
  TStickerVisualState,
  TSurfaceType,
  TTextVisualState,
} from '@/utils/types/global'
import { LocalStorageHelper } from '@/utils/localstorage'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { useProductStore } from '@/stores/product/product.store'
import { useSearchParams } from 'react-router-dom'

/**
 * Restore mockup visual states từ localStorage
 */
const restoreMockupVisualStates = (mockupId: string) => {
  console.log('>>> mock:', { mockupId })
  const savedMockup = LocalStorageHelper.getSavedMockupData()
  console.log('>>> savedMockup:', savedMockup)
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
  console.log('>>> ko tim thay:', {
    foundMockup,
    foundProductVariant,
    foundProductId,
  })

  if (!foundMockup || !foundProductVariant || !foundProductId) return

  const { addStickerElement, addTextElement, addPrintedImageElement } =
    useEditedElementStore.getState()
  const { getProductById } = useProductStore.getState()
  useEditedElementStore.getState().resetData()

  // Restore text elements
  const restoredTextElements = foundMockup.elementsVisualState.texts || []
  console.log('>>> texts:', restoredTextElements)
  if (restoredTextElements.length > 0) {
    useEditedElementStore.getState().addTextElement(restoredTextElements)
  }

  // Restore sticker elements
  const restoredStickerElements = foundMockup.elementsVisualState.stickers || []
  console.log('>>> stickers:', restoredStickerElements)
  if (restoredStickerElements.length > 0) {
    useEditedElementStore.getState().addStickerElement(restoredStickerElements)
  }

  // Restore printed image elements
  const restoredPrintedImageElements = foundMockup.elementsVisualState.printedImages || []
  console.log('>>> printed images:', restoredPrintedImageElements)
  if (restoredPrintedImageElements.length > 0) {
    useEditedElementStore.getState().addPrintedImageElement(restoredPrintedImageElements)
  }

  // Restore product selection
  const product = useProductStore.getState().getProductById(foundProductId)
  console.log('>>> product 86:', product)
  if (!product) return
  const variantId = foundProductVariant.variantId
  const variant = product.variants.find((v) => v.id === variantId)
  if (!variant) return
  useProductUIDataStore.getState().handlePickVariant(variant)

  // Restore surface type
  useProductUIDataStore.getState().handlePickVariantSurface(variantId, foundMockup.surfaceInfo.id)
}

type TEditedElementsAreaProps = {
  allowedPrintAreaRef: React.RefObject<HTMLDivElement | null>
  printAreaContainerRef: React.RefObject<HTMLDivElement | null>
}

export const EditedElementsArea = ({
  allowedPrintAreaRef,
  printAreaContainerRef,
}: TEditedElementsAreaProps) => {
  const stickerElements = useEditedElementStore((s) => s.stickerElements)
  const textElements = useEditedElementStore((s) => s.textElements)
  const selectedElement = useEditedElementStore((s) => s.selectedElement)
  const selectElement = useEditedElementStore((s) => s.selectElement)
  const mockupId = useSearchParams()[0].get('mockupId')
  const firstRenderRef = useRef(true)
  console.log('>>> mockup id:', { mockupId, stickerElements, textElements })

  useEffect(() => {
    console.log('>>> run this 115')
    if (mockupId && firstRenderRef.current) {
      restoreMockupVisualStates(mockupId)
      firstRenderRef.current = false
    }
  }, [mockupId])
  useEffect(() => {
    console.log('>>> stickerElements changed:', stickerElements)
  }, [stickerElements])
  useEffect(() => {
    console.log('>>> textElements changed:', textElements)
  }, [textElements])
  return (
    <>
      {stickerElements.length > 0 &&
        stickerElements.map((element) => (
          <StickerElement
            key={element.id}
            element={element}
            elementContainerRef={allowedPrintAreaRef}
            mountType={mockupId ? 'from-saved' : 'from-new'}
            isSelected={selectedElement?.elementId === element.id}
            selectElement={selectElement}
            removeStickerElement={(elementId) => {
              useElementLayerStore.getState().removeFromElementLayers([elementId])
              useEditedElementStore.getState().removeStickerElement(elementId)
            }}
            printAreaContainerRef={printAreaContainerRef}
          />
        ))}

      {textElements.length > 0 &&
        textElements.map((element) => (
          <TextElement
            key={element.id}
            element={element}
            elementContainerRef={allowedPrintAreaRef}
            mountType={mockupId ? 'from-saved' : 'from-new'}
            isSelected={selectedElement?.elementId === element.id}
            selectElement={selectElement}
            removeTextElement={(elementId) => {
              useElementLayerStore.getState().removeFromElementLayers([elementId])
              useEditedElementStore.getState().removeTextElement(elementId)
            }}
            printAreaContainerRef={printAreaContainerRef}
          />
        ))}
    </>
  )
}
