import { TLayoutPlacedImage } from '@/utils/types/print-layout'

type TPlacedImageProps = {
  placedImage: TLayoutPlacedImage
  onImageLoad?: () => void
}

export const PlacedImage = ({ placedImage, onImageLoad }: TPlacedImageProps) => {
  return (
    <img
      onDragStart={(e) => e.preventDefault()}
      src={placedImage.url}
      alt="Ảnh in của bạn"
      className="NAME-frame-placed-image object-cover object-center h-full w-full absolute top-0 left-0 z-10 select-none"
      onLoad={(e) => onImageLoad?.()}
    />
  )
}
