import { usePrintArea } from '@/hooks/use-print-area'
import { TBaseProduct, TPrintedImage } from '@/utils/types/global'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PrintAreaOverlay } from './PrintAreaOverlay'
import { EditedElementsArea } from './EditedElementsArea'
import { AddToCartHandler } from './AddToCartHandler'
import { adjustNearF3F4F6, getFinalColorValue } from '@/utils/helpers'
import { SectionLoading } from '@/components/custom/Loading'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { createCommonConstants } from '@/utils/contants'
import { useZoomEditBackground } from '@/hooks/use-zoom-edit-background'
import { adjustSizeOfPlacedImageOnPlaced, cancelSelectingZoomingImages } from '../helpers'
import { useEditAreaStore } from '@/stores/ui/edit-area.store'
import { useDragEditBackground } from '@/hooks/use-drag-edit-background'
import { useEditedElementStore } from '@/stores/element/element.store'
import { MyDevComponent } from '@/dev/components/Preview'
import { buildDefaultTemplateLayout } from '../customize/default-template/builder'

type TZoomButtonsProps = {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
  setZoom: (scale: number) => void
  minZoom: number
  maxZoom: number
}

const ZoomButtons = ({
  scale,
  onZoomIn,
  onZoomOut,
  setZoom,
  minZoom,
  maxZoom,
}: TZoomButtonsProps) => {
  const [hasSnappedTo100, setHasSnappedTo100] = useState(false)

  // Hàm xử lý zoom với logic snap to 100%
  const handleZoom = (direction: 'in' | 'out') => {
    // Tính toán giá trị zoom tiếp theo dựa trên logic thực tế của controls
    // zoomIn: scale * 1.2, zoomOut: scale * 0.8
    const nextScale = direction === 'in' ? scale * 1.2 : scale * 0.8

    // Kiểm tra nếu giá trị tiếp theo vượt qua hoặc tụt dưới 100%
    const crosses100 =
      (direction === 'in' && scale < 1 && nextScale >= 1) ||
      (direction === 'out' && scale > 1 && nextScale <= 1)

    if (crosses100 && !hasSnappedTo100) {
      // Snap to 100% lần đầu tiên
      setZoom(1)
      setHasSnappedTo100(true)
    } else {
      // Zoom bình thường
      if (direction === 'in') {
        onZoomIn()
      } else {
        onZoomOut()
      }
      setHasSnappedTo100(false)
    }
  }

  return (
    <div className="5xl:text-xl 5xl:w-16 smd:bottom-4 smd:right-4 absolute z-52 bottom-1 right-1 flex flex-col p-1 w-10 items-center gap-2 bg-white rounded-lg shadow-lg border border-gray-200">
      <button
        onClick={() => handleZoom('in')}
        disabled={scale >= maxZoom}
        className="smd:p-1 flex items-center justify-center rounded hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        aria-label="Zoom in"
      >
        <svg
          className="w-4 h-4 text-gray-700 5xl:w-8 5xl:h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <span className="5xl:text-[1em] text-xs font-medium text-gray-700 text-center leading-none">
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={() => handleZoom('out')}
        disabled={scale <= minZoom}
        className="smd:p-1 flex items-center justify-center rounded hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        aria-label="Zoom out"
      >
        <svg
          className="w-4 h-4 text-gray-700 5xl:w-8 5xl:h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
    </div>
  )
}

type TDisplayedImage = {
  surfaceId: TBaseProduct['printAreaList'][number]['id']
  variantId: TBaseProduct['variants'][number]['id']
  imageURL: string
  altText: string
}

type TLivePreviewProps = {
  pickedProduct: TBaseProduct
  editedVariantId: TBaseProduct['variants'][number]['id']
  pickedSurfaceId: TBaseProduct['printAreaList'][number]['id']
  printedImages: TPrintedImage[]
}

export const LivePreview = ({
  pickedProduct,
  editedVariantId,
  pickedSurfaceId,
  printedImages,
}: TLivePreviewProps) => {
  const printAreaInfo = useMemo(() => {
    return pickedProduct.printAreaList.find(
      (printArea) => printArea.id === pickedSurfaceId && printArea.variantId === editedVariantId
    )!
  }, [pickedProduct.id, pickedProduct.printAreaList, pickedSurfaceId, editedVariantId])

  const minZoom = 0.8
  const maxZoom = 3
  const {
    scale,
    controls,
    translate,
    printAreaContainerWrapperRef,
    allowedPrintAreaRef,
    maxZoomAllowedPrintAreaIntoView,
  } = useZoomEditBackground(minZoom, maxZoom)

  const handlePrintAreaUpdated = () => {
    setTimeout(() => {
      eventEmitter.emit(EInternalEvents.ELEMENTS_OUT_OF_BOUNDS_CHANGED)
      controls.reset()
      const now = performance.now()
      const defaultTemplate = buildDefaultTemplateLayout(
        printAreaContainerRef.current!,
        allowedPrintAreaRef.current!,
        printedImages,
        4
      )
      useEditedElementStore.getState().setPrintedImageElements(defaultTemplate.elements)
      const nowEnd = performance.now()
      console.log('>>> [bui] du:', nowEnd - now)
      console.log('>>> [bui] printed:', printedImages)
      console.log('>>> [bui] def:', defaultTemplate)
      maxZoomAllowedPrintAreaIntoView()
    }, createCommonConstants<number>('ANIMATION_DURATION_PRINT_AREA_BOUNDS_CHANGE') + 50)
  }

  const { printAreaRef, printAreaContainerRef, checkIfAnyElementOutOfBounds, isOutOfBounds } =
    usePrintArea(printAreaInfo, handlePrintAreaUpdated, scale)

  const displayedImage = useMemo<TDisplayedImage>(() => {
    const variantSurface = pickedProduct.printAreaList.find(
      (variantSurface) =>
        variantSurface.variantId === editedVariantId && variantSurface.id === pickedSurfaceId
    )
    return {
      surfaceId: pickedSurfaceId,
      variantId: editedVariantId,
      imageURL: variantSurface?.imageUrl || pickedProduct.url,
      altText: pickedProduct.name,
    }
  }, [pickedProduct, editedVariantId, pickedSurfaceId])

  const imgURLRef = useRef<string>(displayedImage.imageURL)

  const displayProductChangingModal = (forceShow: boolean = false) => {
    if (!forceShow && imgURLRef.current === displayedImage.imageURL) return
    const modal = document.body.querySelector<HTMLElement>('.NAME-product-changing-modal')
    const maxTimeWait = 6000
    if (modal) {
      modal.style.display = 'flex'
      setTimeout(() => {
        modal.style.display = 'none'
      }, maxTimeWait)
    }
  }

  const removeProductChangingModal = (forceHide: boolean = false) => {
    if (!forceHide && imgURLRef.current === displayedImage.imageURL) return
    imgURLRef.current = displayedImage.imageURL
    const modal = document.body.querySelector<HTMLElement>('.NAME-product-changing-modal')
    if (modal) {
      modal.style.display = 'none'
    }
  }

  const listenPointerDownCapture = (e: React.PointerEvent<HTMLElement>) => {
    const target = e.target as HTMLElement
    if (
      !(
        target.closest('.NAME-element-interactive-buttons') ||
        target.closest('.NAME-zoom-placed-image-btn-wrapper')
      )
    ) {
      cancelSelectingZoomingImages()
      useEditedElementStore.getState().cancelSelectingElement()
    }
  }

  useEffect(() => {
    displayProductChangingModal()
    setTimeout(() => {
      removeProductChangingModal()
    }, 6000)
  }, [displayedImage.imageURL])

  useEffect(() => {
    adjustSizeOfPlacedImageOnPlaced()
  }, [])

  useEffect(() => {
    useEditAreaStore.getState().setEditAreaScaleValue(scale)
  }, [scale])

  return (
    <div
      ref={(node) => {
        // refForZoom.current = node
        printAreaContainerWrapperRef.current = node
      }}
      onPointerDownCapture={listenPointerDownCapture}
      onDragStart={(e) => e.preventDefault()}
      className="NAME-print-area-container-wrapper smd:w-full overflow-hidden w-full min-h-full h-full relative flex items-center justify-center"
    >
      <MyDevComponent />
      <AddToCartHandler
        checkIfAnyElementOutOfBounds={checkIfAnyElementOutOfBounds}
        printAreaContainerRef={printAreaContainerRef}
      />
      <div className="NAME-product-changing-modal flex absolute inset-0 z-99 bg-black/30 justify-center items-center">
        <SectionLoading
          message="Đang tải ảnh sản phẩm..."
          classNames={{ shapesContainer: 'text-white', message: 'text-white' }}
        />
      </div>
      <div
        style={{ display: isOutOfBounds ? 'block' : 'none' }}
        className="NAME-out-of-bounds-overlay-warning-top z-51 absolute top-0 left-0 text-sm text-white font-medium bg-red-600 px-3 py-1 rounded-br-md"
      >
        Ngoài phạm vi in cho phép
      </div>
      <div
        ref={(node) => {
          printAreaContainerRef.current = node
          // refForDrag.current = node
        }}
        className="NAME-print-area-container origin-center w-full h-full min-h-[150px] overflow-hidden bg-gray-100 border z-50 border-gray-400/30 relative"
        style={{
          backgroundColor: adjustNearF3F4F6(getFinalColorValue() || '#ffffff'),
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
        }}
      >
        <div
          style={{ display: isOutOfBounds ? 'block' : 'none' }}
          className="NAME-out-of-bounds-overlay-warning absolute inset-0 bg-red-600/20 z-5"
        ></div>
        <img
          src={displayedImage.imageURL}
          alt={displayedImage.altText}
          crossOrigin="anonymous"
          className="NAME-product-image w-full h-full object-contain object-center relative z-4"
          onLoad={() => removeProductChangingModal(true)}
        />
        <PrintAreaOverlay
          registerRef={(node) => {
            allowedPrintAreaRef.current = node
            printAreaRef.current = node
          }}
          isOutOfBounds={isOutOfBounds}
          displayWarningOverlay
          printedImages={printedImages}
          frameDisplayerOptions={{
            classNames: { container: 'NAME-frames-displayer-print-area' },
          }}
        />
        <EditedElementsArea
          allowedPrintAreaRef={printAreaRef}
          printAreaContainerRef={printAreaContainerRef}
        />
      </div>

      <ZoomButtons
        scale={scale}
        onZoomIn={controls.zoomIn}
        setZoom={controls.setZoom}
        onZoomOut={controls.zoomOut}
        minZoom={minZoom}
        maxZoom={maxZoom}
      />
    </div>
  )
}
