import { TPrintedImage, TPrintTemplate, TTemplateFrame } from '@/utils/types/global'
import { FramesDisplayer } from '../customize/template/FrameDisplayer'
import { cn } from '@/configs/ui/tailwind-utils'
import { useTemplateStore } from '@/stores/ui/template.store'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useEditedElementStore } from '@/stores/element/element.store'
import { useEffect } from 'react'
import { initPlacedImageStyle } from '../helpers'
import {
  styleFrameByTemplateType,
  styleToFramesDisplayerByTemplateType,
} from '@/configs/print-template/templates-helpers'
import { AddImageIcon, TemplateFrame } from '../customize/template/TemplateFrame'
import { PlacedImage } from '../customize/template/PlacedImage'
import { adjustSizeOfPlacedImageOnPlaced } from './test'

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
      <FramesDisplayer
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
}>

export const PrintAreaOverlay = ({
  printAreaRef,
  isOutOfBounds,
  printAreaOptions,
  displayWarningOverlay = true,
  printedImages,
  frameDisplayerOptions,
}: TPrintAreaOverlayProps) => {
  const pickedTemplate = useTemplateStore((s) => s.pickedTemplate)

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
        'NAME-print-area-allowed z-6 border border-white border-dashed flex justify-center items-center absolute transition-all duration-300',
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
        />
      )}
    </div>
  )
}
