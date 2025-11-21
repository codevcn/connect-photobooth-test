import {
  TframePerfectRectType,
  TPrintTemplate,
  TSizeInfo,
  TTemplateFrame,
} from '@/utils/types/global'
import { FramesDisplayer } from './FrameDisplayer'
import { useEffect, useMemo } from 'react'
import { cn } from '@/configs/ui/tailwind-utils'
import { useTemplateStore } from '@/stores/ui/template.store'
import { hardCodedPrintTemplates } from '@/configs/data/print-template'
import { EInternalEvents, eventEmitter } from '@/utils/events'

type TTemplatePickerProps = {
  printedImagesCount: number
} & Partial<{
  classNames: Partial<{
    templatesList: string
    templateItem: string
  }>
}>

export const TemplatesPicker = ({ printedImagesCount, classNames }: TTemplatePickerProps) => {
  const templates = useTemplateStore((s) => s.allTemplates)
  const initializeTemplates = useTemplateStore((s) => s.initializeTemplates)

  const availableTemplates = useMemo<TPrintTemplate[]>(() => {
    return templates.filter((template) => template.framesCount <= printedImagesCount)
  }, [printedImagesCount, templates])
  const pickTemplate = useTemplateStore((s) => s.pickTemplate)

  const handlePickFrame = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    frameId: TTemplateFrame['id'],
    frameSize: TSizeInfo
  ) => {
    const frameEle = e.currentTarget.querySelector<HTMLElement>('.NAME-frame-placed-image')
    if (frameEle) {
      eventEmitter.emit(EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL, true, frameId, frameSize)
    }
  }

  useEffect(() => {
    initializeTemplates(hardCodedPrintTemplates())
  }, [])

  return (
    <div className={classNames?.templatesList}>
      {availableTemplates.map((template) => (
        <div
          key={template.id}
          onClick={() => pickTemplate(template)}
          className={cn(
            'flex items-center justify-center border border-gray-300 rounded p-1 bg-white mobile-touch cursor-pointer transition',
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
                className="lucide lucide-image-icon lucide-image text-gray-500 w-8 h-8"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            }
            frameStyles={{
              container: { backgroundColor: 'white' },
            }}
            onClickFrame={handlePickFrame}
          />
        </div>
      ))}
    </div>
  )
}
