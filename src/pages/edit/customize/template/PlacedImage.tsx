import { stylePlacedImageByTemplateType } from '@/configs/print-template/templates-helpers'
import { TPlacedImage, TTemplateFrame, TTemplateType } from '@/utils/types/global'
import { useDragImageInFrame } from '@/hooks/element/use-drag-image-in-frame'

type TPlacedImageProps = {
  placedImage: TPlacedImage
  templateType: TTemplateType
  frameIndex: TTemplateFrame['index']
}

export const PlacedImage = ({ placedImage, templateType, frameIndex }: TPlacedImageProps) => {
  const { placementState } = placedImage

  // Hook để kéo ảnh trong frame với ràng buộc boundary
  // const { imageRef } = useDragImageInFrame({
  //   frameId: placedImage.id,
  //   initialPosition: { x: 0, y: 0 },
  //   disabled: false,
  //   saveElementPosition: (frameId, position) => {
  //     // TODO: Có thể lưu vị trí vào store nếu cần
  //     // console.log(`Image ${frameId} moved to:`, position)
  //   },
  // })

  return (
    <div className="NAME-frame-placed-image w-full h-full relative">
      <img
        // ref={imageRef as React.RefObject<HTMLImageElement>}
        src={placedImage.imgURL}
        alt="Placed Image"
        className="h-full w-full absolute top-0 left-0"
        style={{
          objectFit: placementState.objectFit,
          willChange: 'transform',
          ...stylePlacedImageByTemplateType(templateType, frameIndex, {
            objectPosition: placementState.direction,
          }),
        }}
      />
    </div>
  )
}
