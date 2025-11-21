import { TPrintedImage, TSizeInfo } from '@/utils/types/global'
import { useMemo, useState } from 'react'
import { PrintedImagesModal } from './PrintedImagesModal'
import { useTemplateStore } from '@/stores/ui/template.store'
import { matchPrintedImageToShapeSize } from '@/utils/helpers'
import { toast } from 'react-toastify'
import { createPortal } from 'react-dom'

type TPrintedImagesProps = {
  printedImages: TPrintedImage[]
}

export const PrintedImagesPreview = ({ printedImages }: TPrintedImagesProps) => {
  const [showPrintedImagesModal, setShowPrintedImagesModal] = useState(false)
  const addImageToFrame = useTemplateStore((s) => s.addImageToFrame)

  const displayedImage = useMemo<TPrintedImage | null>(() => {
    return printedImages.length > 0 ? printedImages[0] : null
  }, [printedImages])

  const handleAddImageToFrame = (printedImg: TPrintedImage, imgSize: TSizeInfo) => {
    if (matchPrintedImageToShapeSize(printedImg, imgSize)) {
      addImageToFrame(printedImg)
    } else {
      toast.error('Ảnh chọn không phù hợp với khung hình. Vui lòng chọn ảnh khác.')
    }
  }

  return (
    <div className="flex justify-center min-w-[50px] rounded text-pink-cl w-fit active:scale-90 transition relative">
      <div
        className="border-border rounded-md cursor-pointer"
        onClick={() => setShowPrintedImagesModal(true)}
      >
        {displayedImage && (
          <div
            key={displayedImage.id}
            className="flex items-center h-[50px] overflow-hidden rounded"
          >
            <img
              src={displayedImage.url}
              alt="Printed image"
              className={`h-max w-max max-h-[50px] max-w-20 my-auto object-contain rounded`}
            />
          </div>
        )}
      </div>
      {showPrintedImagesModal &&
        createPortal(
          <PrintedImagesModal
            onAddImage={handleAddImageToFrame}
            onClose={() => setShowPrintedImagesModal(false)}
            printedImages={printedImages}
          />,
          document.body
        )}
    </div>
  )
}
