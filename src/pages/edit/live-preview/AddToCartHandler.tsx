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
  TPrintAreaInfo,
} from '@/utils/types/global'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { cleanPrintAreaOnExtractMockupImage } from '../helpers'

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
  const { saveHtmlAsImage, saveHtmlAsImageWithDesiredSize } = useHtmlToCanvas()

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
    return [null, null, null, null]
  }

  const handleAddToCart = async (
    elementsVisualState: TElementsVisualState,
    onDoneAdd: () => void,
    onError: (error: Error) => void
  ) => {
    if (!sessionId) return
    if (
      printAreaContainerRef.current?.querySelector<HTMLElement>(
        '.NAME-print-area-allowed[data-is-out-of-bounds="true"]'
      )
    ) {
      return onError(
        new Error('Vui lòng đảm bảo tất cả phần tử nằm trong vùng in trước khi thêm vào giỏ hàng')
      )
    }
    const [message, pickedVariant, pickedProduct, pickedSurface] = validateBeforeAddToCart()
    if (message) {
      return onError(new Error(message))
    }
    if (!pickedVariant || !pickedProduct || !pickedSurface || !printAreaContainerRef.current) return
    const { printAreaContainer, allowedPrintArea, removeMockPrintArea } =
      cleanPrintAreaOnExtractMockupImage(printAreaContainerRef.current)
    if (!printAreaContainer || !allowedPrintArea) {
      return onError(new Error('Không tìm thấy khu vực in trên sản phẩm'))
    }
    const imgMimeType: TImgMimeType = 'image/png'
    saveHtmlAsImage(
      printAreaContainer,
      imgMimeType,
      8,
      (imageData) => {
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
            dataUrl: URL.createObjectURL(imageData),
            size: {
              width: -1,
              height: -1,
            },
          },
          elementsVisualState
        )
        saveHtmlAsImageWithDesiredSize(
          allowedPrintArea,
          pickedSurface.area.widthRealPx,
          pickedSurface.area.heightRealPx,
          imgMimeType,
          (imageData, canvasWithDesiredSize) => {
            removeMockPrintArea()
            productService
              .preSendMockupImage(
                imageData,
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
                    width: canvasWithDesiredSize.width,
                    height: canvasWithDesiredSize.height,
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
          },
          (error) => {
            console.error('Error saving mockup image:', error)
            toast.warning(error.message || 'Không thể tạo mockup để lưu lên server')
            onError(error)
          }
        )
        toast.success('Đã thêm vào giỏ hàng')
        useProductUIDataStore.getState().setCartCount(LocalStorageHelper.countSavedMockupImages())
        onDoneAdd()
      },
      (error) => {
        console.error('Error saving mockup image:', error)
        useProductUIDataStore.getState().setCartCount(LocalStorageHelper.countSavedMockupImages())
        onError(error || new Error('Không thể lưu mockup, không thể thêm sản phẩm vào giỏ hàng'))
      }
    )
  }

  const listenAddToCart = () => {
    const setIsAddingToCart = useProductUIDataStore.getState().setIsAddingToCart
    setIsAddingToCart(true)
    useEditedElementStore.getState().cancelSelectingElement()
    // Thu thập visual states của tất cả elements
    handleAddToCart(
      collectMockupVisualStates(printAreaContainerRef.current || undefined),
      () => {
        useProductUIDataStore.getState().setIsAddingToCart(false)
      },
      (error) => {
        toast.error(error.message || 'Đã có lỗi xảy ra khi thêm vào giỏ hàng')
        setIsAddingToCart(false)
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
