import { TframePerfectRectType, TPrintTemplate, TSizeInfo } from '@/utils/types/global'
import { TemplateFrame } from './TemplateFrame'
import type React from 'react'
import { cn } from '@/configs/ui/tailwind-utils'
import { styleToFramesDisplayerByTemplateType } from '@/utils/helpers'

type TFramesDisplayerProps = {
  template: TPrintTemplate
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
  displayerClassNames: {
    container: string
  }
  onClickFrame: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    frameId: string,
    frameSize: TSizeInfo
  ) => void
}>

export const FramesDisplayer = ({
  template,
  plusIconReplacer,
  frameStyles,
  frameClassNames,
  displayerClassNames,
  onClickFrame,
}: TFramesDisplayerProps) => {
  const { frames, type } = template
  return (
    <div
      className={cn(
        'NAME-frames-displayer bg-gray-600/30 p-0.5 max-h-full max-w-full',
        displayerClassNames?.container
      )}
      style={{ ...styleToFramesDisplayerByTemplateType(type) }}
    >
      {frames.map((frame) => (
        <TemplateFrame
          key={frame.id}
          templateFrame={frame}
          templateType={type}
          plusIconReplacer={plusIconReplacer}
          styles={frameStyles}
          classNames={frameClassNames}
          onClickFrame={onClickFrame}
        />
      ))}
    </div>
  )
}
