import {
  TBaseProduct,
  TClientProductVariant,
  TPrintAreaInfo,
  TPrintedImage,
} from '@/utils/types/global'
import { usePrintArea } from '@/hooks/use-print-area'
import { usePrintedImageStore } from '@/stores/printed-image/printed-image.store'
import { useEffect, useRef, useState } from 'react'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TPrintLayout } from '@/utils/types/print-layout'
import { hardCodedLayoutData as hardCodedLayoutDataFun } from '@/configs/print-layout/print-layout-data-Fun'
import { useLayoutStore } from '@/stores/ui/print-layout.store'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { useEditedElementStore } from '@/stores/element/element.store'
import { useVisualStatesCollector } from '@/hooks/use-visual-states-collector'
import { checkIfMobileScreen, resetAllStores } from '@/utils/helpers'
import { AppNavigator } from '@/utils/navigator'

const createInitialLayout = (): TPrintLayout => {
  return {
    ...hardCodedLayoutDataFun('full')[0],
    printedImageElements: [],
  }
}

type TProductProps = {
  product: TBaseProduct
  firstPrintAreaInProduct: TPrintAreaInfo
  productIndex: number
  onPickProduct: (
    product: TBaseProduct,
    initialLayout: TPrintLayout,
    firstPrintAreaInProduct: TPrintAreaInfo,
    initialVariant?: TClientProductVariant
  ) => void
  isPicked: boolean
  onInitFirstProduct: (
    product: TBaseProduct,
    initialLayout: TPrintLayout,
    firstPrintAreaInProduct: TPrintAreaInfo,
    initialVariant?: TClientProductVariant
  ) => void
  printedImages: TPrintedImage[]
  productsCount: number
}

const Product = ({
  product,
  onPickProduct,
  isPicked,
  onInitFirstProduct,
  firstPrintAreaInProduct,
  printedImages,
  productIndex,
  productsCount,
}: TProductProps) => {
  const [initialLayout, setInitialLayout] = useState<TPrintLayout>()
  const isMobileScreen = checkIfMobileScreen()
  // const wantedVariantRef = useRef<TClientProductVariant | undefined>(undefined)

  const buildInitialLayout = () => {
    requestAnimationFrame(() => {
      setInitialLayout(createInitialLayout())
      onInitFirstProduct(
        product,
        createInitialLayout(),
        firstPrintAreaInProduct
        // wantedVariantRef.current
      )
    })
  }

  const hardCode_displayProductName = (product: TBaseProduct): string => {
    const productId = product.id
    if (productId === 31) {
      return 'Móc chìa khóa'
    } else if (productId === 30) {
      return 'Nến thơm'
    } else if (productId === 29) {
      return 'Áo nỉ'
    } else if (productId === 27) {
      return 'Bình giữ nhiệt'
    } else if (productId === 25) {
      return 'Túi vải'
    } else if (productId === 23) {
      return 'Khung tranh'
    } else if (productId === 21) {
      return 'Ốp điện thoại'
    } else if (productId === 19) {
      return 'Cốc nước'
    } else if (productId === 17) {
      return 'Cốc uống nước'
    } else if (productId === 7) {
      return 'Áo thun'
    }
    return ''
  }

  const { printAreaContainerRef } = usePrintArea(firstPrintAreaInProduct, buildInitialLayout)

  useEffect(() => {
    buildInitialLayout()
  }, [product.id])

  // const hardCode_findBlackColor = (): string => {
  //   let imageURL: string = firstPrintAreaInProduct.imageUrl
  //   const productId = product.id
  //   if (productId !== 29 && productId !== 25 && productId !== 7) return imageURL
  //   // Tìm màu đen rồi chọn nó làm màu mặc định nếu có
  //   const wantedVariant = product.variants.find(
  //     (variant) =>
  //       variant.attributes.color?.toLowerCase() === 'black' ||
  //       variant.attributes.color?.toLowerCase() === 'đen'
  //   )
  //   if (wantedVariant) {
  //     wantedVariantRef.current = wantedVariant
  //     const foundPrintArea = product.printAreaList.find(
  //       (printArea) => printArea.variantId === wantedVariant.id
  //     )?.imageUrl
  //     if (foundPrintArea) {
  //       imageURL = foundPrintArea
  //     }
  //   }
  //   return imageURL
  // }

  const findFirstDisplayedMockup = (): string => {
    const firstVariant = product.variants[0]
    const mockup = product.printAreaList.find(
      (printArea) => printArea.variantId === firstVariant.id
    )
    return mockup?.imageUrl || firstPrintAreaInProduct.imageUrl
  }

  return (
    <div
      ref={(node) => {
        // previewPrintAreaContainerRef.current = node
        printAreaContainerRef.current = node
      }}
      data-product-id={product.id}
      data-is-picked={isPicked}
      className={`${productIndex === productsCount && !isMobileScreen ? 'mb-8' : ''} ${
        isPicked ? 'outline-2 outline-main-cl' : 'outline-0'
      } NAME-gallery-product spmd:w-full spmd:h-auto smd:rounded-lg group h-full rounded-lg aspect-square cursor-pointer mobile-touch outline-0 hover:outline-2 hover:outline-main-cl relative`}
      onClick={() => {
        if (initialLayout)
          onPickProduct(product, initialLayout, firstPrintAreaInProduct, product.variants[0])
      }}
    >
      <div
        className={`${
          isPicked ? 'outline-2 outline-main-cl' : 'outline-0'
        } NAME-gallery-child-to-render 5xl:text-[20px] smd:text-[14px] smd:font-bold smd:pt-1.5 5xl:pt-2.5 font-[Roboto] font-bold w-full text-center z-10 h-fit px-2 pt-2.5 rounded-b-lg whitespace-nowrap group-hover:outline-2 group-hover:outline-main-cl truncate absolute top-[98%] left-0 text-[14px] text-black`}
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 100%)`,
        }}
      >
        <div className="smd:top-0.5 w-full h-1.5 smd:h-1 5xl:h-1.5 bg-white absolute top-0 left-0"></div>
        {hardCode_displayProductName(product)}
      </div>
      <div className="NAME-gallery-child-to-rounded w-full h-full bg-white border border-gray-200 relative rounded-t-lg z-20">
        <img
          src={findFirstDisplayedMockup() || '/images/placeholder.svg'}
          alt={product.name}
          className="NAME-product-image absolute top-0 left-0 min-h-full max-h-full w-full h-full object-contain rounded-xl"
        />
      </div>
      {/* <PrintAreaOverlayPreview
        registerPrintAreaRef={(node) => {
          printAreaRef.current = node
          // previewPrintAreaRef.current = node
        }}
        displayMockupOnMobile={false}
      />
      {!isMobileScreen &&
        initialLayout?.printedImageElements.map((printedImageVisualState) => (
          <PreviewImage
            key={printedImageVisualState.id}
            printedImageVisualState={printedImageVisualState}
          />
        ))} */}
    </div>
  )
}

type TProductGalleryProps = {
  products: TBaseProduct[]
  printedImages: TPrintedImage[]
}

type TConfirmExitModalProps = {
  show: boolean
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmExitModal = ({ show, onConfirm, onCancel }: TConfirmExitModalProps) => {
  if (!show) return null

  return (
    <div className="5xl:text-2xl fixed inset-0 z-999 flex items-center justify-center bg-black/50 animate-pop-in p-4">
      <div onClick={onCancel} className="absolute inset-0"></div>
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full relative z-10 p-4">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-main-cl p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-triangle-alert-icon lucide-triangle-alert text-white w-6 h-6 5xl:w-12 5xl:h-12"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="5xl:text-[1em] text-xl font-bold text-gray-800 text-center mb-3">
          Bạn có thực sự muốn rời khỏi khu vực chỉnh sửa?
        </h3>

        {/* Description */}
        <p className="5xl:text-[0.8em] font-medium text-gray-600 text-center mb-6 text-sm">
          Tất cả chỉnh sửa của bạn sẽ bị xóa và không thể khôi phục.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg active:scale-95 transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-main-cl hover:bg-dark-main-cl text-white font-bold py-3 px-4 rounded-lg active:scale-95 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

export const ProductGallery = ({ products }: TProductGalleryProps) => {
  const printedImages = usePrintedImageStore((s) => s.printedImages)
  const pickedProduct = useProductUIDataStore((s) => s.pickedProduct)
  const allLayouts = useLayoutStore((s) => s.allLayouts)
  const mockupId = useSearchParams()[0].get('mockupId')
  const firstProduct = useProductUIDataStore((s) => s.firstProduct)
  const setFirstProduct = useProductUIDataStore((s) => s.setFirstProduct)
  const { collectMockupVisualStates } = useVisualStatesCollector()
  const navigate = useNavigate()
  const [showExitModal, setShowExitModal] = useState(false)
  const galleryRef = useRef<HTMLDivElement | null>(null)
  const initialGalleryHeight = useRef<number>(0)

  const handleConfirmExit = () => {
    resetAllStores()
    AppNavigator.navTo(navigate, '/')
  }

  const handleCancelExit = () => {
    setShowExitModal(false)
  }

  const handleBackButtonClick = () => {
    setShowExitModal(true)
  }

  const saveAndRecoverProductVisualState = (
    prePickedProduct: TBaseProduct,
    newPickedProduct: TBaseProduct,
    initialLayout: TPrintLayout
  ) => {
    const elementsVisualState = collectMockupVisualStates()
    const { resetData, addSavedElementVisualState } = useEditedElementStore.getState()
    resetData()
    useElementLayerStore.getState().resetData()
    addSavedElementVisualState(prePickedProduct.id, {
      ...elementsVisualState,
    })
    if (useEditedElementStore.getState().checkSavedElementsVisualStateExists(newPickedProduct.id)) {
      // useLayoutStore.getState().setLayoutForDefault(null)
      useEditedElementStore.getState().recoverSavedElementsVisualStates(newPickedProduct.id)
    } else {
      // useLayoutStore.getState().setLayoutForDefault(initialLayout)
      useLayoutStore.getState().pickLayout(initialLayout)
    }
  }

  const handlePickProduct = (
    product: TBaseProduct,
    initialLayout: TPrintLayout,
    firstPrintAreaInProduct: TPrintAreaInfo,
    initialVariant?: TClientProductVariant
  ) => {
    if (!pickedProduct) return
    if (pickedProduct.id === product.id) return
    saveAndRecoverProductVisualState(pickedProduct, product, initialLayout)
    useProductUIDataStore.getState().setLoadedAllowedPrintedArea(false)
    useProductUIDataStore
      .getState()
      .handlePickProduct(product, firstPrintAreaInProduct, initialVariant)
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
      console.log('>>> [ini] initFirstProduct:', { pickedProduct, allLayouts, firstProduct })
      if (!pickedProduct) {
        const product = products[0]
        const initialLayout = createInitialLayout()
        const firstPrintAreaInProduct = product.printAreaList[0]
        // let wantedVariant: TClientProductVariant | undefined = undefined

        // const hardCode_findBlackColor = () => {
        //   const productId = product.id
        //   if (productId !== 29 && productId !== 25 && productId !== 7) return
        //   // Tìm màu đen rồi chọn nó làm màu mặc định nếu có
        //   const variant = product.variants.find(
        //     (variant) =>
        //       variant.attributes.color?.toLowerCase() === 'black' ||
        //       variant.attributes.color?.toLowerCase() === 'đen'
        //   )
        //   if (variant) {
        //     wantedVariant = variant
        //   }
        // }
        // hardCode_findBlackColor()

        useProductUIDataStore
          .getState()
          .handlePickFirstProduct(
            product,
            firstPrintAreaInProduct,
            initialLayout,
            product.variants[0]
          )
      }
    }
  }

  const handleSetFirstProduct = (
    firstProductInList: TBaseProduct,
    initialLayout: TPrintLayout,
    initialSurface: TPrintAreaInfo,
    initialVariant?: TClientProductVariant
  ) => {
    if (firstProductInList.id === products[0].id) {
      setFirstProduct(firstProductInList, initialSurface, initialLayout, initialVariant)
    }
  }

  const findProductIndex = () => {
    return products.findIndex((p) => p.id === pickedProduct?.id) + 1
  }
  const scrollableBox = useRef<HTMLDivElement>(null)

  const [thumbWidth, setThumbWidth] = useState(0)
  const [thumbLeft, setThumbLeft] = useState(0)
  const [hasScroll, setHasScroll] = useState(false)

  const update = () => {
    const el = scrollableBox.current
    if (!el) return

    const totalWidth = el.scrollWidth
    const visibleWidth = el.clientWidth

    const canScroll = totalWidth > visibleWidth
    setHasScroll(canScroll)

    if (!canScroll) {
      setThumbWidth(0)
      setThumbLeft(0)
      return
    }

    const ratio = visibleWidth / totalWidth
    const thumbMinWidth = 20
    const w = Math.max(visibleWidth * ratio, thumbMinWidth)

    setThumbWidth(w)

    const maxThumbLeft = visibleWidth - w
    const scrollRatio = el.scrollLeft / (totalWidth - visibleWidth)
    setThumbLeft(maxThumbLeft * scrollRatio)
  }

  useEffect(() => {
    update()
    const el = scrollableBox.current
    if (!el) return

    el.addEventListener('scroll', update)
    window.addEventListener('resize', update)

    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  // useEffect(() => {
  //   initFirstProduct()
  // }, [products.map((p) => p.id).join(','), pickedProduct?.id])

  useEffect(() => {
    update()
  }, [products.length])

  useEffect(() => {
    initFirstProduct()
  }, [pickedProduct?.id])

  useEffect(() => {
    scrollToPickedProduct()
  }, [pickedProduct?.id])

  useEffect(() => {
    const stayGalleryOnTopPage = () => {
      if (!checkIfMobileScreen()) return
      const galleryEle = galleryRef.current
      if (!galleryEle) return
      if (!initialGalleryHeight.current) {
        initialGalleryHeight.current = galleryEle.getBoundingClientRect().height
      }
      const galleryWrapper = galleryEle.closest<HTMLElement>('.NAME-products-gallery-wrapper')
      if (!galleryWrapper) return
      const scrollableBox = galleryEle.querySelector<HTMLElement>('.NAME-scrollable-box')
      if (!scrollableBox) return
      const scrollbar = galleryEle.querySelector<HTMLElement>('.NAME-gallery-scrollbar')
      if (!scrollbar) return
      if (window.scrollY > 170) {
        galleryWrapper.style.cssText = `height: ${initialGalleryHeight.current}px; width: ${galleryEle.offsetWidth}px;`
        galleryEle.style.cssText = 'position: fixed; width: 100vw; z-index: 999; height: 96px;'
        scrollableBox.style.cssText = 'padding: 8px 8px 8px;'
        scrollableBox.classList.add('NAME-gallery-parent-to-hide', 'animate-pop-in')
        scrollbar.classList.replace('hidden', 'block')
        galleryEle
          .querySelector<HTMLElement>('.NAME-floating-gallery-title')
          ?.classList.remove('hidden')
        scrollableBox.style.height = `${96 - 26}px`
      } else {
        galleryWrapper.style.cssText = 'height: auto; width: auto;'
        galleryEle.style.cssText = 'position: static; width: 100%; z-index: 1; height: 150px;'
        scrollableBox.style.cssText = 'padding: 8px 12px 32px;'
        scrollableBox.classList.remove('NAME-gallery-parent-to-hide', 'animate-pop-in')
        scrollbar.classList.replace('block', 'hidden')
        galleryEle
          .querySelector<HTMLElement>('.NAME-floating-gallery-title')
          ?.classList.add('hidden')
        scrollableBox.style.height = '100%'
      }
    }
    window.addEventListener('scroll', stayGalleryOnTopPage)
    return () => {
      window.removeEventListener('scroll', stayGalleryOnTopPage)
    }
  }, [])

  const hasProducts = products && products.length > 0

  return (
    <div className="spmd:pb-3 spmd:h-screen spmd:w-auto md:text-base relative text-sm w-full h-fit flex flex-col bg-white border-r border-r-gray-200">
      <div className="smd:hidden smd:text-[1.3rem] top-2 right-2.5 bg-gray-100 z-40 rounded py-0.5 px-1 text-xs text-gray-600 absolute shadow-md">
        {findProductIndex()}
        <span>/</span>
        {products.length}
      </div>
      <ConfirmExitModal
        show={showExitModal}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
      <button
        onClick={handleBackButtonClick}
        className="smd:flex smd:py-1 hidden gap-3 cursor-pointer mobile-touch items-center justify-center font-bold w-full py-3 px-1 border-b border-gray-300 bg-main-cl text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#fff"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-arrow-big-left-icon lucide-arrow-big-left w-6 h-6 5xl:w-8 5xl:h-8 text-white"
        >
          <path d="M13 9a1 1 0 0 1-1-1V5.061a1 1 0 0 0-1.811-.75l-6.835 6.836a1.207 1.207 0 0 0 0 1.707l6.835 6.835a1 1 0 0 0 1.811-.75V16a1 1 0 0 1 1-1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z" />
        </svg>
        <span className="5xl:inline 5xl:text-2xl smd:text-lg">Quay về</span>
      </button>
      <h2 className="5xl:text-[1.3em] smd:text-[0.9em] text-[1em] py-2 px-2 w-full text-center font-bold text-gray-800">
        Chọn sản phẩm
        <span className="smd:inline hidden font-light">
          <span> </span>(
          <span>
            <span>{findProductIndex()}</span>
            <span>/</span>
            <span>{products.length}</span>
          </span>
          <span>)</span>
        </span>
      </h2>
      <div className="NAME-products-gallery-wrapper spmd:overflow-y-auto spmd:max-h-full">
        <div
          ref={(node) => {
            galleryRef.current = node
          }}
          className="NAME-products-gallery spmd:overflow-y-auto spmd:max-h-full spmd:flex-col spmd:h-fit no-scrollbar h-[150px] w-full bg-white/80 top-0 left-0"
        >
          <h2 className="NAME-floating-gallery-title smd:hidden hidden text-sm font-bold text-center pt-0.5">
            Chọn sản phẩm
          </h2>
          <div
            ref={(node) => {
              scrollableBox.current = node
            }}
            className="NAME-scrollable-box spmd:px-1.5 smd:py-2 smd:pb-2 smd:pt-4 smd:flex-col 5xl:gap-y-12 smd:gap-y-8 flex items-center gap-x-2 w-full h-full overflow-x-auto gallery-scroll px-3 pt-1.5 pb-8"
          >
            {hasProducts &&
              products.map((product, index) => {
                const firstPrintArea = product.printAreaList[0]
                return (
                  <Product
                    key={product.id}
                    product={product}
                    firstPrintAreaInProduct={firstPrintArea}
                    isPicked={product.id === pickedProduct?.id}
                    onPickProduct={handlePickProduct}
                    onInitFirstProduct={() => {}}
                    printedImages={printedImages}
                    productIndex={index + 1}
                    productsCount={products.length}
                  />
                )
              })}
          </div>
          {hasProducts && hasScroll && (
            <div className="NAME-gallery-scrollbar pl-2 hidden relative bottom-0 left-0 w-full h-1 bg-black/10 rounded-md">
              <div
                style={{
                  left: thumbLeft,
                  width: thumbWidth,
                }}
                className="absolute bottom-0 h-full bg-gray-400 rounded-md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
