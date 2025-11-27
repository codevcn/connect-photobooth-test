import { TPlacedImage, TTemplateFrame, TTemplateType } from '@/utils/types/global'
import { stylePlacedImageByTemplateType } from '@/configs/print-template/templates-helpers'
import { useRef } from 'react'

type TPlacedImageProps = {
  placedImage: TPlacedImage
  templateType: TTemplateType
  frameIndex: TTemplateFrame['index']
  frame: TTemplateFrame
  isLog?: boolean
  registerChild?: (index: number, el: HTMLImageElement | null) => void
  childIndex?: number
  onImageLoad?: () => void
}

export const PlacedImage = ({
  placedImage,
  templateType,
  frameIndex,
  frame,
  isLog,
  registerChild,
  childIndex,
  onImageLoad,
}: TPlacedImageProps) => {
  const { placementState } = placedImage

  const imgRef = useRef<HTMLImageElement | null>(null)
  const handleRef = (el: HTMLImageElement | null) => {
    imgRef.current = el
    if (registerChild && childIndex !== undefined) {
      registerChild(childIndex, el)
    }
  }

  return (
    <img
      onDragStart={(e) => e.preventDefault()}
      ref={handleRef}
      src={placedImage.imgURL}
      alt="Ảnh in của bạn"
      className="NAME-frame-placed-image h-full w-full absolute top-0 left-0"
      style={{
        objectFit: placementState.objectFit,
        willChange: 'transform',
        ...stylePlacedImageByTemplateType(templateType, placedImage, frame, {}, isLog),
      }}
      onLoad={(e) => onImageLoad?.()}
      // data-placed-image-meta-data={JSON.stringify(
      //   typeToObject<TPlacedImageMetaData>({
      //     placedImageInitialSize:,
      //     frameInitialSize,
      //   })
      // )}
    />
  )
}
