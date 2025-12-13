import { cn } from '@/configs/ui/tailwind-utils'
import { TLayoutSlotConfig, TPrintLayout } from '@/utils/types/print-layout'
import { PlacedImage } from './PlacedImage'

type TAddImageIconProps = {} & Partial<{
  classNames: Partial<{
    plusIconWrapper: string
  }>
  styles: Partial<{
    container: React.CSSProperties
    plusIconWrapper: React.CSSProperties
  }>
}>

export const AddImageIcon = ({ styles, classNames }: TAddImageIconProps) => {
  return (
    <div
      style={styles?.plusIconWrapper}
      className={cn(
        'NAME-plus-icon-wrapper flex items-center justify-center text-white h-full w-full bg-gray-400/90',
        classNames?.plusIconWrapper
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-plus-icon lucide-plus"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    </div>
  )
}

type TemplateFrameProps = {
  layoutSlot: TLayoutSlotConfig
  layoutId: TPrintLayout['id']
} & Partial<{
  styles: Partial<{
    container: React.CSSProperties
    plusIconWrapper: React.CSSProperties
  }>
  classNames: Partial<{
    container: string
    plusIconWrapper: string
  }>
  onClickFrame: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    slotId: string,
    layoutId: string
  ) => void
  scrollable: boolean
  onImageLoad?: () => void
}>

export const LayoutSlot = ({
  layoutSlot,
  layoutId,
  styles,
  classNames,
  onClickFrame,
  scrollable = true,
  onImageLoad,
}: TemplateFrameProps) => {
  return (
    <div
      style={{
        ...styles?.container,
      }}
      className={cn(
        'NAME-template-frame relative flex justify-center items-center overflow-hidden h-full w-full border border-gray-600 border-dashed',
        classNames?.container,
        scrollable ? '' : 'touch-none'
      )}
      onClick={onClickFrame ? (e) => onClickFrame(e, layoutSlot.id, layoutId) : undefined}
    >
      {layoutSlot.placedImage ? (
        <PlacedImage placedImage={layoutSlot.placedImage} onImageLoad={onImageLoad} />
      ) : (
        <AddImageIcon />
      )}
    </div>
  )
}
