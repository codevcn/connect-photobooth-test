import { TLayoutPlacedImage, TLayoutType } from '@/utils/types/print-layout'

type TPlacedImageProps = {
  placedImage: TLayoutPlacedImage
  onImageLoad?: () => void
  layoutType: TLayoutType
}

export const PlacedImage = ({ placedImage, onImageLoad, layoutType }: TPlacedImageProps) => {
  return (
    <img
      onDragStart={(e) => e.preventDefault()}
      src={placedImage.url}
      alt="Ảnh in của bạn"
      className="NAME-frame-placed-image object-center h-full w-full absolute top-0 left-0 z-10 select-none"
      style={{
        objectFit: placedImage.isOriginalFrameImage ? 'contain' : 'cover',
      }}
      onLoad={(e) => onImageLoad?.()}
    />
  )
}
