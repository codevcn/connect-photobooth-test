import { TPrintedImage, TPrintTemplate, TTemplateFrame } from '@/utils/types/global'
import { cn } from '@/configs/ui/tailwind-utils'
import { useTemplateStore } from '@/stores/ui/template.store'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useEditedElementStore } from '@/stores/element/element.store'

import type React from 'react'
import { styleToFramesDisplayerByTemplateType } from '@/configs/print-template/templates-helpers'
import { TemplateFrame } from '../customize/template/TemplateFrame'
import { FramesDisplayer } from '../customize/template/FrameDisplayer'
import { createCommonConstants } from '@/utils/contants'

type TFramesDisplayerProps = {
  template: TPrintTemplate
  printedImages: TPrintedImage[]
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
  onClickFrame: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, frameId: string) => void
  displayScrollButton: boolean
  displaySelectingColor: boolean
  allowDragging: boolean
  scrollable: boolean
}>

const FramesDisplayerForOverview = ({
  template,
  plusIconReplacer,
  frameStyles,
  frameClassNames,
  displayerClassNames,
  onClickFrame,
  displaySelectingColor = false,
  scrollable = true,
}: TFramesDisplayerProps) => {
  const { type } = template
  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        className={cn(
          'NAME-frames-displayer relative p-0.5 h-full w-full',
          displayerClassNames?.container
        )}
        style={{ ...styleToFramesDisplayerByTemplateType(type) }}
      >
        {template.frames.map((frame, idx) => (
          <TemplateFrame
            key={frame.id}
            templateFrame={frame}
            templateType={type}
            plusIconReplacer={plusIconReplacer}
            styles={frameStyles}
            classNames={frameClassNames}
            onClickFrame={onClickFrame}
            childIndex={idx}
            displaySelectingColor={displaySelectingColor}
            scrollable={scrollable}
          />
        ))}
      </div>
    </div>
  )
}

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
        `${printTemplate.type} z-5 flex justify-center items-center absolute transition duration-200`,
        printAreaOptions?.className
      )}
    >
      <FramesDisplayerForOverview
        template={printTemplate}
        frameClassNames={{
          container: 'border-none',
          plusIconWrapper: 'hidden',
        }}
        displayerClassNames={{ container: 'bg-transparent' }}
        allowDragging={false}
        printedImages={[]}
      />
    </div>
  )
}

type TPrintAreaOverlayProps = {
  printAreaRef: React.RefObject<HTMLDivElement | null>
  isOutOfBounds: boolean
  printedImages: TPrintedImage[]
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
  onClickFrame: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, frameId: string) => void
  frameDisplayerOptions: {
    classNames: {
      container: string
    }
  }
  containerScale?: number
}>

export const PrintAreaOverlay = ({
  printAreaRef,
  isOutOfBounds,
  printAreaOptions,
  displayWarningOverlay = true,
  printedImages,
  frameDisplayerOptions,
  containerScale = 1,
}: TPrintAreaOverlayProps) => {
  const pickedTemplate = useTemplateStore((s) => s.pickedTemplate)
  console.log('>>> [ddd] view picked template:', pickedTemplate)

  const handleClickFrame = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    frameId: TTemplateFrame['id']
  ) => {
    const image = e.currentTarget.querySelector<HTMLImageElement>('.NAME-frame-placed-image')
    if (image) {
      let elementURL: string | undefined = undefined
      const pickedFrame = useTemplateStore.getState().getFrameById(frameId)
      if (pickedFrame) {
        elementURL = pickedFrame.placedImage?.imgURL
      }
      useEditedElementStore
        .getState()
        .selectElement(frameId, e.currentTarget, 'template-frame', elementURL)
      // eventEmitter.emit(EInternalEvents.PICK_ELEMENT, frameId, e.currentTarget, 'template-frame')
    } else {
      eventEmitter.emit(EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL, true, frameId)
    }
  }

  return (
    <div
      ref={printAreaRef}
      className={cn(
        'NAME-print-area-allowed z-6 border border-white border-dashed flex justify-center items-center absolute transition',
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
        animationDuration:
          createCommonConstants<number>('ANIMATION_DURATION_PRINT_AREA_BOUNDS_CHANGE') + 'ms',
      }}
      data-is-out-of-bounds={isOutOfBounds}
    >
      {pickedTemplate && (
        <FramesDisplayer
          template={pickedTemplate}
          onClickFrame={handleClickFrame}
          frameClassNames={{
            container: 'cursor-pointer',
          }}
          displayerClassNames={frameDisplayerOptions?.classNames}
          displayScrollButton
          displaySelectingColor
          scrollable={false}
          printedImages={printedImages}
          containerScale={containerScale}
        />
      )}
    </div>
  )
}
