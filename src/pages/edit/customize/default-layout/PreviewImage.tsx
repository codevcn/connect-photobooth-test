import { TPrintedImageVisualState } from '@/utils/types/global'

type TPrintedImageProps = {
  printedImageVisualState: TPrintedImageVisualState
}

export const PreviewImage = ({ printedImageVisualState }: TPrintedImageProps) => {
  const { position, height, width } = printedImageVisualState
  return (
    <div
      style={{
        top: position.y,
        left: position.x,
        width,
        height,
      }}
      className="absolute pointer-events-none overflow-hidden select-none"
    >
      <img
        src={printedImageVisualState.path}
        alt="Ảnh photobooth"
        style={{
          height,
          aspectRatio: width! / height!,
        }}
      />
    </div>
  )
}
