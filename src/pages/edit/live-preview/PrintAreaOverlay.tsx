import { TPrintTemplate } from '@/utils/types/global'
import { cn } from '@/configs/ui/tailwind-utils'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useLayoutStore } from '@/stores/ui/print-layout.store'
import { checkIfMobileScreen } from '@/utils/helpers'
import { SlotsDisplayer } from '../customize/print-layout/SlotDisplayer'
import { TLayoutSlotConfig } from '@/utils/types/print-layout'

type TPrintAreaOverlayPreviewProps = {
  registerPrintAreaRef: (node: HTMLDivElement | null) => void
} & Partial<{
  printAreaOptions: {
    className: string
  }
  displayMockupOnMobile: boolean
}>

export const PrintAreaOverlayPreview = ({
  printAreaOptions,
  registerPrintAreaRef,
  displayMockupOnMobile = true,
}: TPrintAreaOverlayPreviewProps) => {
  return (
    <div
      ref={registerPrintAreaRef}
      className={cn(
        `z-49 flex justify-center items-center absolute`,
        printAreaOptions?.className,
        displayMockupOnMobile && checkIfMobileScreen() ? '' : 'smd:block hidden'
      )}
    >
      {/* <FramesDisplayerForPreview
        template={printTemplate}
        frameClassNames={{
          container: 'border-none',
          plusIconWrapper: 'hidden',
        }}
        displayerClassNames={{ container: 'bg-transparent' }}
        allowDragging={false}
        printedImages={[]}
      /> */}
    </div>
  )
}

type TPrintAreaOverlayProps = {
  isOutOfBounds: boolean
} & Partial<{
  printAreaOptions: {
    className: string
  }
  displayWarningOverlay: boolean
  onClickFrame: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, frameId: string) => void
  registerRef: (allowedPrintArea: HTMLDivElement | null) => void
}>

export const PrintAreaOverlay = ({
  isOutOfBounds,
  printAreaOptions,
  displayWarningOverlay = true,
  registerRef,
}: TPrintAreaOverlayProps) => {
  const pickedLayout = useLayoutStore((s) => s.pickedLayout)

  const handleClickFrame = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    slotId: TLayoutSlotConfig['id'],
    layoutId: TPrintTemplate['id']
  ) => {
    eventEmitter.emit(EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL, true, slotId, layoutId)
  }

  return (
    <div
      ref={(node) => {
        registerRef?.(node)
      }}
      className={cn(
        'NAME-print-area-allowed z-6 border border-white border-dashed flex justify-center items-center absolute',
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
      data-is-out-of-bounds={isOutOfBounds}
    >
      {pickedLayout && pickedLayout.mountType === 'picked' && (
        <SlotsDisplayer
          layout={pickedLayout}
          frameClassNames={{
            container: 'cursor-pointer',
          }}
          scrollable={false}
          onClickFrame={handleClickFrame}
        />
      )}
    </div>
  )
}
