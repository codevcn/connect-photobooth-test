import { TPrintedImage, TPrintTemplate, TTemplateFrame } from '@/utils/types/global'
import { cn } from '@/configs/ui/tailwind-utils'
import { useTemplateStore } from '@/stores/ui/template.store'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { TemplateFrame } from './TemplateFrame'
import type React from 'react'
import { styleToFramesDisplayerByTemplateType } from '@/configs/print-template/templates-helpers'
import { useMemo } from 'react'
import {
  initFramePlacedImageByPrintedImage,
  matchBestPrintedImageToTemplate,
  matchPrintedImageToShapeSize,
} from '../../helpers'

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
        />
      ))}
    </div>
  )
}

type TTemplatePickerProps = {
  printedImages: TPrintedImage[]
} & Partial<{
  classNames: Partial<{
    templatesList: string
    templateItem: string
  }>
}>

export const TemplatesPicker = ({ printedImages, classNames }: TTemplatePickerProps) => {
  const allTemplates = useTemplateStore((s) => s.allTemplates)

  const finalTemplates = useMemo(() => {
    const templates = [...allTemplates]
    let imgPoint: number = Number.MAX_SAFE_INTEGER
    let foundImage: TPrintedImage | null = null
    for (const template of templates) {
      let foundFrame: TTemplateFrame | null = null
      for (const frame of template.frames) {
        let point: number = 0
        if (template.type === '1-square') {
          frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, printedImages[2])
        } else if (template.type === '2-horizon') {
          frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, printedImages[0])
        } else if (template.type === '2-vertical') {
          frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, printedImages[1])
        } else if (template.type === '3-left') {
          frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, printedImages[1])
        } else if (template.type === '3-right') {
          frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, printedImages[1])
        } else if (template.type === '3-top') {
          frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, printedImages[1])
        } else if (template.type === '3-bottom') {
          frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, printedImages[1])
        } else if (template.type === '4-square') {
          frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, printedImages[2])
        } else {
          frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, printedImages[1])
        }
        // const match = matchPrintedImageToShapeSize(
        //   {
        //     width: frame.width,
        //     height: frame.height,
        //   },
        //   {
        //     height: image.height,
        //     width: image.width,
        //   }
        // )
        // if (match) {
        //   point += Math.abs(frame.width / frame.height - image.width / image.height) || 1
        // }
        // if (point < imgPoint) {
        //   imgPoint = point
        //   frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, image)
        //   foundFrame = frame
        // }
      }
      // if (!foundFrame) {
      //   for (const frame of template.frames) {
      //     frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, printedImages[0])
      //   }
      // }
    }
    console.log('>>> templates:', templates)
    return templates
  }, [allTemplates, printedImages])

  const handlePickTemplate = (template: TPrintTemplate) => {
    const pickedSurface = useProductUIDataStore.getState().pickedSurface
    if (!pickedSurface) return
    useTemplateStore.getState().pickTemplate(template, pickedSurface)
  }

  return (
    <div className="NAME-sss w-full">
      <h3 className="smd:text-base text-xs mb-1 font-bold text-gray-800">Chọn mẫu in</h3>
      <div className={classNames?.templatesList}>
        {finalTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => handlePickTemplate(template)}
            className={cn(
              'flex items-center justify-center min-h-16 border border-gray-300 rounded bg-white mobile-touch cursor-pointer transition',
              classNames?.templateItem
            )}
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
