import { TPrintTemplate, TTemplateFrame, TPrintedImage, TBaseProduct } from '@/utils/types/global'
import { getInitialContants } from '@/utils/contants'
import { create } from 'zustand'

type TTemplateStore = {
  allTemplates: TPrintTemplate[]
  currentTemplate: TPrintTemplate | null
  showTemplatePicker: boolean
  pickedFrame: TTemplateFrame | undefined

  // Actions
  initializeTemplates: (templates: TPrintTemplate[]) => void
  pickTemplate: (template: TPrintTemplate) => void
  hideShowTemplatePicker: (show: boolean) => void
  pickFrame: (frame: TTemplateFrame | undefined) => void
  addImageToFrame: (printedImage: TPrintedImage, frameId?: string) => void
  updateFrameImageURL: (newURL: string, frameId: string, idOfURLImage?: string) => void
  removeFrameImage: (frameId: string) => void
}

export const useTemplateStore = create<TTemplateStore>((set, get) => ({
  allTemplates: [],
  currentTemplate: null,
  showTemplatePicker: false,
  pickedFrame: undefined,

  initializeTemplates: (templates) => {
    set({
      allTemplates: templates,
      currentTemplate: templates[0] || null,
    })
  },

  pickTemplate: (template) => {
    const { currentTemplate } = get()
    if (currentTemplate && currentTemplate.id === template.id) return
    set({ currentTemplate: template })
  },

  hideShowTemplatePicker: (show) => {
    set({ showTemplatePicker: show })
  },

  pickFrame: (frame) => {
    set({ pickedFrame: frame })
  },

  addImageToFrame: (printedImage, frameId) => {
    const { allTemplates, currentTemplate } = get()
    if (!currentTemplate) return

    const templates = [...allTemplates]
    const currentTemplateId = currentTemplate.id

    if (frameId) {
      // Thêm vào frame cụ thể
      for (const template of templates) {
        let frameIndex: number = getInitialContants<number>('PLACED_IMG_FRAME_INDEX')
        for (const frame of template.frames) {
          if (frame.id === frameId) {
            frame.placedImage = {
              id: printedImage.id,
              imgURL: printedImage.url,
              placementState: {
                frameIndex,
                zoom: getInitialContants<number>('PLACED_IMG_ZOOM'),
                objectFit: getInitialContants<'contain'>('PLACED_IMG_OBJECT_FIT'),
                squareRotation: getInitialContants<number>('PLACED_IMG_SQUARE_ROTATION'),
                direction: getInitialContants<'center'>('PLACED_IMG_DIRECTION'),
              },
            }
          }
          frameIndex++
        }
      }
    } else {
      // Thêm vào frame trống đầu tiên của template được chọn
      for (const template of templates) {
        if (template.id === currentTemplateId) {
          const foundFrameIndex = template.frames.findIndex((f) => !f.placedImage)
          if (foundFrameIndex >= 0) {
            template.frames[foundFrameIndex].placedImage = {
              id: printedImage.id,
              imgURL: printedImage.url,
              placementState: {
                frameIndex: foundFrameIndex + 1,
                zoom: getInitialContants<number>('PLACED_IMG_ZOOM'),
                objectFit: getInitialContants<'contain'>('PLACED_IMG_OBJECT_FIT'),
                squareRotation: getInitialContants<number>('PLACED_IMG_SQUARE_ROTATION'),
                direction: getInitialContants<'center'>('PLACED_IMG_DIRECTION'),
              },
            }
            break
          }
        }
      }
    }

    set({ allTemplates: templates })
  },

  updateFrameImageURL: (newURL, frameId, idOfURLImage) => {
    const { allTemplates } = get()
    const templates = [...allTemplates]

    for (const template of templates) {
      const foundFrame = template.frames.find((f) => f.id === frameId)
      if (foundFrame) {
        if (foundFrame.placedImage) {
          foundFrame.placedImage.imgURL = newURL
          if (idOfURLImage) {
            foundFrame.placedImage.id = idOfURLImage
          }
        }
        break
      }
    }

    set({ allTemplates: templates })
  },

  removeFrameImage: (frameId) => {
    const { allTemplates } = get()
    const templates = [...allTemplates]

    for (const template of templates) {
      const foundFrame = template.frames.find((f) => f.id === frameId)
      if (foundFrame && foundFrame.placedImage) {
        foundFrame.placedImage = undefined
        break
      }
    }

    set({ allTemplates: templates })
  },
}))
