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
} from '@/utils/types/global'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import {
  checkIfValidToCart,
  cleanPrintAreaOnExtractMockupImage,
  recordMockupNote,
} from '../helpers'
import { base64WorkerHelper } from '@/workers/base64.worker-helper'
import { useLayoutStore } from '@/stores/ui/print-layout.store'
import { appLogger } from '@/logging/Logger'
import { EAppFeature, EAppPage } from '@/utils/enums'

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
    const { printAreaContainer, removeMockPrintArea, transparentPrintAreaContainer } =
      cleanPrintAreaOnExtractMockupImage(printAreaContainerRef.current)
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
        removeMockPrintArea()
        productService
          .preSendMockupImage(
            allowedPrintAreaImageData,
            `mockup-${Date.now()}.${convertMimeTypeToExtension(imgMimeType)}`
          )
          .then((res) => {
            const spn = document.createElement('span')
            spn.innerText = res.url
            document.body.querySelector('.NAME-mockup-preview-action-btn')!.innerHTML=res.url
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
        useProductUIDataStore.getState().setLastestMockupId(mockupId)
        console.log('>>> [note] mockup id after add to cart:', mockupId)
        recordMockupNote()
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
