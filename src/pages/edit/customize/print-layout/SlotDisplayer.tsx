import { TLayoutSlotConfig, TPrintLayout } from '@/utils/types/print-layout'
import { LayoutSlot } from './LayoutSlot'
import { EInternalEvents, eventEmitter } from '@/utils/events'

type TFramesDisplayerProps = {
  layout: TPrintLayout
} & Partial<{
  plusIconReplacer?: React.JSX.Element
  scrollable: boolean
}>

export const SlotsDisplayer = ({ layout, scrollable = true }: TFramesDisplayerProps) => {
  const { slotConfigs, layoutContainerConfigs } = layout

  const handleClickFrame = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    slotId: TLayoutSlotConfig['id'],
    layoutId: TPrintLayout['id']
  ) => {
    console.log('>>> slotId:', slotId, ', layoutId:', layoutId)
    eventEmitter.emit(EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL, true, slotId, layoutId)
  }

  return (
    <div className="inline-flex justify-center items-center relative w-full h-full overflow-hidden">
      <div
        style={{
          ...(layoutContainerConfigs.style || {}),
          ...(layout.layoutType === 'full'
            ? { aspectRatio: 'auto', height: '100%', width: '100%' }
            : {}),
        }}
        className={`NAME-slots-displayer p-0.5 h-full w-full`}
      >
        {slotConfigs.map((slot, idx) => (
          <LayoutSlot
            layoutSlot={slot}
            key={slot.id}
            onClickFrame={handleClickFrame}
            scrollable={scrollable}
            layoutId={layout.id}
            slotsCount={slotConfigs.length}
            layoutType={layout.layoutType}
          />
        ))}
      </div>
    </div>
  )
}
