import { useGlobalContext } from '@/contexts/global-context'
import { useHtmlToCanvas } from '@/hooks/use-html-to-canvas'
import { useVisualStatesCollector } from '@/hooks/use-visual-states-collector'
import { productService } from '@/services/product.service'
import { useEditedElementStore } from '@/stores/element/element.store'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { convertMimeTypeToExtension } from '@/utils/helpers'
import { LocalStorageHelper } from '@/utils/localstorage'
import {
  TBaseProduct,
  TClientProductVariant,
  TElementsVisualState,
  TImgMimeType,
  TMockupData,
  TPrintAreaInfo,
  TPrintedImageVisualState,
  TStickerVisualState,
  TTextVisualState,
} from '@/utils/types/global'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import {
  checkIfValidToCart,
  cleanPrintAreaOnExtractMockupImage,
  getMockupByVariantAndSurface,
  recordMockupNote,
} from '../helpers'
import { appLogger } from '@/logging/Logger'
import { EAppFeature, EAppPage } from '@/utils/enums'
import { restoreMockupWorkerController } from '@/workers/restore-mockup.worker-controller'
import { useLayoutStore } from '@/stores/ui/print-layout.store'
import { useCommonDataStore } from '@/stores/ui/common-data.store'

const prepareRestoreMockupData = (
  mockupId: TMockupData['id'],
  sessionId: string,
  transparentPrintAreaContainer: HTMLElement,
  clonedAllowedPrintArea: HTMLElement,
  printedImageElements?: TPrintedImageVisualState[],
  stickerElements?: TStickerVisualState[],
  textElements?: TTextVisualState[]
) => {
  try {
    const { pickedSurface, pickedProduct, pickedVariant } = useProductUIDataStore.getState()
    if (!pickedSurface || !pickedProduct || !pickedVariant) return
    const { layoutMode, pickedLayout } = useLayoutStore.getState()
    const printAreaContainerWrapperRect = transparentPrintAreaContainer.getBoundingClientRect()
    const clonedAllowedPrintAreaRect = clonedAllowedPrintArea.getBoundingClientRect()
    const layoutSlotElements = Array.from(
      transparentPrintAreaContainer.querySelectorAll<HTMLElement>(
        '.NAME-print-area-allowed .NAME-slots-displayer .NAME-layout-slot'
      ) || []
    )
    console.log('>>> [resm] layoutSlotElements:', layoutSlotElements)
    restoreMockupWorkerController.sendRestoreMockupData({
      mockupId,
      layoutMode,
      allowedPrintArea: {
        width: clonedAllowedPrintAreaRect.width,
        height: clonedAllowedPrintAreaRect.height,
        x: clonedAllowedPrintAreaRect.left,
        y: clonedAllowedPrintAreaRect.top,
      },
      printAreaContainerWrapper: {
        width: printAreaContainerWrapperRect.width,
        height: printAreaContainerWrapperRect.height,
        x: printAreaContainerWrapperRect.left,
        y: printAreaContainerWrapperRect.top,
      },
      printedImageElements,
      stickerElements,
      textElements,
      layout: pickedLayout,
      layoutSlotsForCanvas: layoutSlotElements.map((ele) => {
        const slotId = ele.getAttribute('data-layout-slot-id') || ''
        const slotConfig = useLayoutStore.getState().getLayoutSlotConfigsById(slotId)
        if (!slotConfig) throw new Error('Slot config not found for id: ' + slotId)
        const rect = ele.getBoundingClientRect()
        return {
          slotId: slotConfig.id,
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          placedImage: {
            imageURL: slotConfig.placedImage?.url || '',
            isOriginalFrameImage: slotConfig.placedImage?.isOriginalFrameImage || false,
          },
        }
      }),
      metadata: {
        sessionId,
      },
      product: {
        id: pickedProduct.id,
        name: pickedProduct.name,
        variantId: pickedSurface.variantId,
        surfaceId: pickedSurface.id,
        mockup: {
          id: pickedSurface.id,
          imageURL:
            getMockupByVariantAndSurface(pickedProduct, pickedVariant.id, pickedSurface.id)
              ?.imageUrl || '',
        },
      },
      localBlobURLsCache: useCommonDataStore.getState().localBlobURLsCache,
    })
  } catch (error) {
    console.error('>>> prepare Restore Mockup Data error:', error)
  }
}

type TAddToCartHandlerProps = {
  printAreaContainerRef: React.RefObject<HTMLDivElement | null>
  checkIfAnyElementOutOfBounds: () => boolean
}

export const AddToCartHandler = ({
  printAreaContainerRef,
  checkIfAnyElementOutOfBounds,
}: TAddToCartHandlerProps) => {
  const { sessionId } = useGlobalContext()
  const { collectMockupVisualStates } = useVisualStatesCollector()
  const { saveHtmlAsImageWithDesiredSize } = useHtmlToCanvas()

  const validateBeforeAddToCart = (): [
    string | null,
    TClientProductVariant | null,
    TBaseProduct | null,
    TPrintAreaInfo | null
  ] => {
    if (checkIfAnyElementOutOfBounds()) {
      return [
        'Vui lòng đảm bảo tất cả phần tử nằm trong vùng in trước khi thêm vào giỏ hàng',
        null,
        null,
        null,
      ]
    }
    const { pickedVariant, pickedProduct, pickedSurface } = useProductUIDataStore.getState()
    if (!pickedVariant) {
      return ['Vui lòng chọn 1 sản phẩm trước khi thêm vào giỏ hàng', null, null, null]
    }
    return [null, pickedVariant, pickedProduct, pickedSurface]
  }

  const handleAddToCart = async (
    elementsVisualState: TElementsVisualState,
    onDoneAdd: (mockupId: TMockupData['id']) => void,
    onError: (error: Error) => void
  ) => {
    console.log('>>> [add] handle add to cart:', { sessionId })
    if (!sessionId) return
    const [message, pickedVariant, pickedProduct, pickedSurface] = validateBeforeAddToCart()
    if (message) {
      return onError(new Error(message))
    }
    if (!pickedVariant || !pickedProduct || !pickedSurface || !printAreaContainerRef.current) return
    const {
      printAreaContainer,
      removeMockPrintArea,
      transparentPrintAreaContainer,
      allowedPrintArea,
    } = cleanPrintAreaOnExtractMockupImage(printAreaContainerRef.current)
    if (!printAreaContainer || !transparentPrintAreaContainer) {
      return onError(new Error('Không tìm thấy khu vực in trên sản phẩm'))
    }
    const imgMimeType: TImgMimeType = 'image/png'
    let renderScale: number = 8
    saveHtmlAsImageWithDesiredSize(
      printAreaContainer,
      transparentPrintAreaContainer,
      pickedSurface.area.widthRealPx,
      pickedSurface.area.heightRealPx,
      renderScale,
      imgMimeType,
      (fullContainerImageData, allowedPrintAreaImageData, allowedPrintAreaCanvas) => {
        const dataURL = URL.createObjectURL(fullContainerImageData)
        const mockupId = LocalStorageHelper.saveMockupImageAtLocal(
          sessionId,
          {
            productId: pickedProduct.id,
            productName: pickedProduct.name,
          },
          {
            variantId: pickedVariant.id,
          },
          {
            id: pickedSurface.id,
            type: pickedSurface.surfaceType,
          },
          {
            dataUrl: dataURL,
            size: {
              width: -1,
              height: -1,
            },
          },
          elementsVisualState
        )
        productService
          .preSendMockupImage(
            allowedPrintAreaImageData,
            `mockup-${Date.now()}.${convertMimeTypeToExtension(imgMimeType)}`
          )
          .then((res) => {
            const result = LocalStorageHelper.updateMockupImagePreSent(
              sessionId,
              pickedProduct.id,
              pickedVariant.id,
              mockupId,
              res.url,
              {
                width: allowedPrintAreaCanvas.width,
                height: allowedPrintAreaCanvas.height,
              }
            )
            if (!result) {
              toast.error('Không thể cập nhật kích thước mockup')
            }
          })
          .catch((err) => {
            console.error('>>> pre-send mockup image error:', err)
            toast.error('Không thể lưu mockup lên server')
          })
        toast.success('Đã thêm vào giỏ hàng')
        useProductUIDataStore.getState().setCartCount(LocalStorageHelper.countSavedMockupImages())
        onDoneAdd(mockupId)

        if (allowedPrintArea) {
          prepareRestoreMockupData(
            mockupId,
            sessionId,
            transparentPrintAreaContainer,
            allowedPrintArea,
            elementsVisualState.printedImages,
            elementsVisualState.stickers,
            elementsVisualState.texts
          )
        }

        removeMockPrintArea()
      },
      (error) => {
        removeMockPrintArea()
        console.error('Error saving mockup image:', error)
        useProductUIDataStore.getState().setCartCount(LocalStorageHelper.countSavedMockupImages())
        onError(error || new Error('Không thể lưu mockup, không thể thêm sản phẩm vào giỏ hàng'))
      }
    )
  }

  const listenAddToCart = () => {
    if (!checkIfValidToCart('add-to-cart')) return

    useProductUIDataStore.getState().setIsAddingToCart(true)
    useEditedElementStore.getState().cancelSelectingElement()
    // Thu thập visual states của tất cả elements
    handleAddToCart(
      collectMockupVisualStates(printAreaContainerRef.current || undefined),
      (mockupId) => {
        useProductUIDataStore.getState().setIsAddingToCart(false)
        recordMockupNote(mockupId)
        appLogger.logInfo(
          'Add to cart completed successfully',
          EAppPage.EDIT,
          EAppFeature.ADD_TO_CART
        )
      },
      (error) => {
        toast.error(error.message || 'Đã có lỗi xảy ra khi thêm vào giỏ hàng')
        useProductUIDataStore.getState().setIsAddingToCart(false)
        appLogger.logError(
          error,
          'Error occurred during add to cart',
          EAppPage.EDIT,
          EAppFeature.ADD_TO_CART
        )
      }
    )
  }

  useEffect(() => {
    eventEmitter.on(EInternalEvents.ADD_TO_CART, listenAddToCart)
    return () => {
      eventEmitter.off(EInternalEvents.ADD_TO_CART, listenAddToCart)
    }
  }, [])

  return <></>
}
