import { TPrintedImage, TPrintTemplate } from '@/utils/types/global'
import { cn } from '@/configs/ui/tailwind-utils'
import { useTemplateStore } from '@/stores/ui/template.store'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { TemplateFrame } from './TemplateFrame'
import type React from 'react'
import { styleToFramesDisplayerByTemplateType } from '@/configs/print-template/templates-helpers'
import { useEffect, useMemo } from 'react'
import { assignMockFrameSizeToTemplate, initFramePlacedImageByPrintedImage } from '../../helpers'
import { useEditModeStore } from '@/stores/ui/edit-mode.store'
import { useEditedElementStore } from '@/stores/element/element.store'

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
  onClickFrame: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, frameId: string) => void
  displayScrollButton: boolean
}>

const FramesDisplayer = ({
  template,
  plusIconReplacer,
  frameStyles,
  frameClassNames,
  displayerClassNames,
  onClickFrame,
  displayScrollButton = false,
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
          displayPlusIcon={false}
        />
      ))}
    </div>
  )
}

type TTemplatePickerProps = {
  printedImages: TPrintedImage[]
}

export const TemplatesPicker = ({ printedImages }: TTemplatePickerProps) => {
  const allTemplates = useTemplateStore((s) => s.allTemplates)

  const finalTemplates = useMemo(() => {
    // Clone templates and their frames deeply enough to avoid mutating store objects
    const templates = allTemplates.map((t) => ({
      ...t,
      frames: t.frames.map((f) => ({ ...f })),
    }))
    for (const template of templates) {
      for (const frame of template.frames) {
        assignMockFrameSizeToTemplate('square', template.type, frame)
        let imgPoint: number = Infinity
        for (const image of printedImages) {
          let point: number = 0
          const frameW = frame.width
          const frameH = frame.height
          const imgW = image.width
          const imgH = image.height
          const imgRatio = imgW / imgH
          const frameRatio = frameW / frameH
          if (imgRatio > frameRatio) {
            const imgWScaled = frameW
            const imgHScaled = imgWScaled / imgRatio
            point = Math.abs(frameH * frameW - imgHScaled * imgWScaled)
          } else if (imgRatio < frameRatio) {
            const imgHScaled = frameH
            const imgWScaled = imgHScaled * imgRatio
            point = Math.abs(frameH * frameW - imgHScaled * imgWScaled)
          }
          if (point < imgPoint) {
            imgPoint = point
            frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, image)
          }
        }
      }
    }
    return templates
  }, [allTemplates, printedImages])

  useEffect(() => {
    for (const template of finalTemplates) {
      useTemplateStore.getState().initializeAddingTemplates([template])
    }
  }, [])

  const handlePickTemplate = (template: TPrintTemplate) => {
    const pickedSurface = useProductUIDataStore.getState().pickedSurface
    if (!pickedSurface) return
    useEditedElementStore.getState().cancelSelectingElement()
    useEditModeStore.getState().setEditMode('with-template')
    useTemplateStore.getState().pickTemplate(template.id, pickedSurface)
  }

  const handlePickNoTemplate = () => {
    useEditModeStore.getState().setEditMode('no-template')
  }

  return (
    <div className="NAME-sss w-full">
      <h3 className="smd:text-base text-xs mb-1 font-bold text-gray-800">Chọn mẫu in</h3>
      <div className="smd:grid-cols-3 smd:overflow-x-hidden smd:grid-flow-row grid-rows-1 grid-flow-col overflow-x-auto grid-flow grid gap-2 w-full gallery-scroll">
        <div
          onClick={handlePickNoTemplate}
          className="flex items-center justify-center flex-col aspect-square min-h-16 border border-dashed p-1 border-gray-600 rounded bg-white mobile-touch cursor-pointer transition"
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
            className="lucide lucide-circle-x-icon lucide-circle-x text-gray-500"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
          <p className="text-gray-700 text-xs mt-1 text-center w-fit font-medium">
            Không <span className="smd:inline hidden">sử dụng</span> mẫu
          </p>
        </div>
        {finalTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => handlePickTemplate(template)}
            className={
              'flex items-center justify-center aspect-square min-h-16 border border-gray-300 rounded bg-white mobile-touch cursor-pointer transition'
            }
          >
            <FramesDisplayer
              template={template}
              plusIconReplacer={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-image-icon lucide-image text-gray-500 min-h-4 min-w-4 w-6 h-6 lg:w-8 lg:h-8 p-0.5"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              }
              frameStyles={{
                container: { backgroundColor: 'white', position: 'relative' },
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
