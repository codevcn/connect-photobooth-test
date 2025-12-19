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
    eventEmitter.emit(EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL, true, slotId, layoutId)
  }

  return (
    <div className="flex justify-center items-center relative w-full h-full overflow-hidden">
      <div
        style={{
          ...(layoutContainerConfigs.style || {}),
        }}
        data-layout-type={layout.layoutType}
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
