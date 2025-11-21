import { stylePlacedImageByTemplateType } from '@/utils/helpers'
import { TPlacedImage, TTemplateFrame, TTemplateType } from '@/utils/types/global'

type TPlacedImageProps = {
  placedImage: TPlacedImage
  templateType: TTemplateType
  frameIndex: TTemplateFrame['index']
}

export const PlacedImage = ({ placedImage, templateType, frameIndex }: TPlacedImageProps) => {
  const { placementState } = placedImage
  return (
    <div className="NAME-frame-placed-image w-full h-full">
      <img
        src={placedImage.imgURL}
        alt="Placed Image"
        className="h-full w-full"
        style={{
          objectFit: placementState.objectFit,
          ...stylePlacedImageByTemplateType(templateType, frameIndex, {
            objectPosition: placementState.direction,
          }),
        }}
      />
    </div>
  )
}
