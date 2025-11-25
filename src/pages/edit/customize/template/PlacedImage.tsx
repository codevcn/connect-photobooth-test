import {
  TPlacedImage,
  TPlacedImageMetaData,
  TTemplateFrame,
  TTemplateType,
} from '@/utils/types/global'
import { useDragImageInFrame } from '@/hooks/element/use-drag-image-in-frame'
import { typeToObject } from '@/utils/helpers'
import { stylePlacedImageByTemplateType } from '@/configs/print-template/templates-helpers'
import { useDragElementInArea } from './use-drag-element-in-area'

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
  //   saveElementPosition: (frameId, position) => {},
  // })

  const { draggedElementRef } = useDragElementInArea('.NAME-frame-placed-image-wrapper')

  return (
    <div className="NAME-frame-placed-image-wrapper flex w-full h-full relative active:scale-95 transition-transform">
      <img
        // ref={imageRef as React.RefObject<HTMLImageElement>}
        ref={draggedElementRef}
        src={placedImage.imgURL}
        alt="Ảnh in của bạn"
        className="NAME-frame-placed-image h-full w-full absolute top-0 left-0"
        style={{
          objectFit: placementState.objectFit,
          willChange: 'transform',
          ...stylePlacedImageByTemplateType(templateType, frameIndex),
        }}
        onDragStart={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onDragOver={(e) => e.preventDefault()}
        crossOrigin="anonymous"
        // data-placed-image-meta-data={JSON.stringify(
        //   typeToObject<TPlacedImageMetaData>({
        //     frameIndex,
        //     templateType: templateType,
        //     placedImageId: placedImage.id,
        //   })
        // )}
      />
    </div>
  )
}
