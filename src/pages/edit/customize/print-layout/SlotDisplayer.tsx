import { TPrintLayout } from '@/utils/types/print-layout'
import { LayoutSlot } from './LayoutSlot'

type TFramesDisplayerProps = {
  layout: TPrintLayout
} & Partial<{
  plusIconReplacer?: React.JSX.Element
  frameStyles: Partial<{
    container: React.CSSProperties
    plusIconWrapper: React.CSSProperties
  }>
  frameClassNames: Partial<{
    container: string
    plusIconWrapper: string
  }>
  onClickFrame: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    slotId: string,
    layoutId: string
  ) => void
  scrollable: boolean
}>

export const SlotsDisplayer = ({
  layout,
  frameStyles,
  frameClassNames,
  onClickFrame,
  scrollable = true,
}: TFramesDisplayerProps) => {
  const { slotConfigs, layoutContainerConfigs } = layout

  return (
    <div className="flex justify-center items-center relative w-full h-full overflow-hidden">
      <div
        style={{ ...(layoutContainerConfigs.style || {}) }}
        className={`NAME-slots-displayer absolute p-0.5 h-full w-full`}
      >
        {slotConfigs.map((slot, idx) => (
          <LayoutSlot
            layoutSlot={slot}
            key={slot.id}
            styles={frameStyles}
            classNames={frameClassNames}
            onClickFrame={onClickFrame}
            scrollable={scrollable}
            layoutId={layout.id}
            slotsCount={slotConfigs.length}
          />
        ))}
      </div>
    </div>
  )
}
