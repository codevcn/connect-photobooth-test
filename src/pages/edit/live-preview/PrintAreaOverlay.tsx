import { TPrintTemplate } from '@/utils/types/global'
import { FramesDisplayer } from '../customize/template/FrameDisplayer'
import { cn } from '@/configs/ui/tailwind-utils'

type TPrintAreaOverlayPreviewProps = {
  printAreaRef: React.RefObject<HTMLDivElement | null>
  printTemplate: TPrintTemplate
} & Partial<{
  printAreaOptions: {
    className: string
  }
}>

export const PrintAreaOverlayPreview = ({
  printTemplate,
  printAreaOptions,
  printAreaRef,
}: TPrintAreaOverlayPreviewProps) => {
  return (
    <div
      ref={printAreaRef}
      className={cn(
        `${printTemplate.type} z-2 flex justify-center items-center absolute transition duration-200`,
        printAreaOptions?.className
      )}
    >
      <FramesDisplayer
        template={printTemplate}
        frameClassNames={{
          container: 'border-none',
          plusIconWrapper: 'hidden',
        }}
        displayerClassNames={{ container: 'bg-transparent' }}
      />
    </div>
  )
}

type TPrintAreaOverlayProps = {
  printAreaRef: React.RefObject<HTMLDivElement | null>
  isOutOfBounds: boolean
  printTemplate: TPrintTemplate
} & Partial<{
  printAreaOptions: {
    className: string
  }
  displayWarningOverlay: boolean
  templateFrameOptions: {
    classNames: {
      conatiner: string
      plusIconWrapper: string
    }
  }
  onClickFrame: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    frameId: string,
    templateRectType: string
  ) => void
  frameDisplayerOptions: {
    classNames: {
      container: string
    }
  }
}>

export const PrintAreaOverlay = ({
  printAreaRef,
  isOutOfBounds,
  printTemplate,
  printAreaOptions,
  displayWarningOverlay,
  onClickFrame,
}: TPrintAreaOverlayProps) => {
  return (
    <div
      ref={printAreaRef}
      className={cn(
        'NAME-print-area-allowed z-5 border border-white border-dashed flex justify-center items-center absolute transition-all duration-300',
        printAreaOptions?.className,
        displayWarningOverlay
          ? isOutOfBounds
            ? 'border-[1.5px] border-dashed border-red-600'
            : 'border-[1.5px] border-dashed border-[#3b82f6]'
          : ''
      )}
      style={{
        backgroundColor: displayWarningOverlay
          ? isOutOfBounds
            ? 'rgba(239, 68, 68, 0.1)'
            : 'rgba(96, 165, 250, 0.1)'
          : 'transparent',
      }}
    >
      <FramesDisplayer template={printTemplate} onClickFrame={onClickFrame} />
    </div>
  )
}
