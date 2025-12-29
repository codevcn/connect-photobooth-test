import { useState, useRef, useEffect, useMemo } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { TPrintedImageVisualState, TUserInputImage } from '@/utils/types/global'
import { toast } from 'react-toastify'
import { SectionLoading } from '@/components/custom/Loading'
import { useImageCrop } from '@/hooks/use-image-crop'
import { useEditedElementStore } from '@/stores/element/element.store'
import { createPortal } from 'react-dom'
import { checkIfMobileScreen, getEditedElementByElementId } from '@/utils/helpers'
import { CropImageElementModal } from './CropImageElementModal'
import { useCommonDataStore } from '@/stores/ui/common-data.store'

type TCropImageElementProps = {}

export const CropImageElement = ({}: TCropImageElementProps) => {
  const selectedElement = useEditedElementStore((s) => s.selectedElement)
  const [showCropModal, setShowCropModal] = useState<boolean>(false)

  const handleCropComplete = (imageBlob: Blob) => {
    if (!selectedElement) return
    const url = useCommonDataStore.getState().createLocalBlobURL(imageBlob)
    const img = new Image()
    img.onload = () => {
      const imgSize = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      }
      const elementId = selectedElement.elementId
      const element = getEditedElementByElementId(elementId)
      const elementVisualStateAttr = element?.getAttribute('data-visual-state')
      if (!elementVisualStateAttr) return
      const elementVisualState: TPrintedImageVisualState = JSON.parse(elementVisualStateAttr)
      if (!elementVisualState.height || !elementVisualState.width) return
      useEditedElementStore.getState().removePrintedImageElement(selectedElement.elementId)
      let heightToRender = imgSize.height
      let widthToRender = imgSize.width
      const imgRatio = widthToRender / heightToRender
      if (imgRatio > elementVisualState.width / elementVisualState.height) {
        widthToRender = elementVisualState.width
        heightToRender = elementVisualState.width / imgRatio
      } else {
        heightToRender = elementVisualState.height
        widthToRender = elementVisualState.height * imgRatio
      }
      useEditedElementStore.getState().addPrintedImageElements([
        {
          id: elementId,
          path: url,
          position: elementVisualState.position,
          angle: elementVisualState.angle,
          scale: elementVisualState.scale,
          zindex: elementVisualState.zindex,
          mountType: elementVisualState.mountType,
          height: heightToRender,
          width: widthToRender,
          isInitWithLayout: elementVisualState.isInitWithLayout,
          matchOrientation: elementVisualState.matchOrientation,
          grayscale: elementVisualState.grayscale,
        },
      ])
      useEditedElementStore.getState().cancelSelectingElement()
      useEditedElementStore.getState().selectElement(elementId, 'printed-image', url)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      toast.error('Không thể tải ảnh đã cắt')
    }
    img.src = url
  }

  return (
    <>
      <button
        onClick={() => setShowCropModal(true)}
        className={
          checkIfMobileScreen()
            ? '5xl:h-14 smd:col-span-1 xl:hidden 2xl:h-8 2xl:col-span-3 h-8 col-span-2 text-white bg-main-cl rounded flex gap-1 items-center mobile-touch justify-center'
            : 'grow text-black rounded flex gap-1 items-center mobile-touch pl-0.5 py-2 justify-start hover:bg-gray-100 w-full'
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-crop-icon lucide-crop w-5.5 h-5.5 5xl:w-8 5xl:h-8 mx-1"
        >
          <path d="M6 2v14a2 2 0 0 0 2 2h14" />
          <path d="M18 22V8a2 2 0 0 0-2-2H2" />
        </svg>
        <span className="ml-1">Cắt ảnh</span>
      </button>

      {showCropModal &&
        selectedElement &&
        selectedElement.elementURL &&
        createPortal(
          <CropImageElementModal
            elementId={selectedElement.elementId}
            imageUrl={selectedElement.elementURL}
            onClose={() => setShowCropModal(false)}
            onCropComplete={handleCropComplete}
          />,
          document.body
        )}
    </>
  )
}
