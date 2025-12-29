import { hardCodedLayoutData } from '@/configs/print-layout/print-layout-data-Fun'
import { generateUniqueId } from '@/utils/helpers'
import { TPrintedImage, TPrintedImageVisualState } from '@/utils/types/global'
import { TLayoutMode, TLayoutType, TPrintLayout } from '@/utils/types/print-layout'
import { create } from 'zustand'

type TLayoutSlotConfig = TPrintLayout['slotConfigs'][number]

type TLayoutStore = {
  pickedLayout: TPrintLayout | null
  allLayouts: TPrintLayout[]
  layoutMode: TLayoutMode
  layoutForDefault: TPrintLayout | null

  pickFrameLayout: (originalFrameImage: TPrintedImage) => void
  pickLayout: (layout: TPrintLayout) => void
  pickNoLayout: () => void
  unpickLayout: () => void
  setAllLayouts: (layouts: TPrintLayout[]) => void
  updateLayoutElements: (layoutId: string, elements: TPrintedImageVisualState[]) => void
  resetData: () => void
  updatePrintedImageInPickedLayout: (
    layoutId: string,
    slotId: string,
    printedImage: TPrintedImage
  ) => void
  addPlacedImageToLayout: (layoutId: string, slotId: string, placedImage: TPrintedImage) => void
  getLayoutByLayoutType: (layoutType: TLayoutType) => TPrintLayout | null
  setLayoutForDefault: (layout: TPrintLayout | null) => void
  restoreLayout: (layout: TPrintLayout) => void
  setLayoutMode: (mode: TLayoutMode) => void
  getLayoutSlotConfigsById: (slotId: TLayoutSlotConfig['id']) => TLayoutSlotConfig | null
}

export const useLayoutStore = create<TLayoutStore>((set, get) => ({
  pickedLayout: null,
  allLayouts: hardCodedLayoutData() || [],
  layoutMode: 'with-layout',
  layoutForDefault: null,

  getLayoutSlotConfigsById: (slotId) => {
    const pickedLayout = get().pickedLayout
    if (!pickedLayout) return null
    return pickedLayout.slotConfigs.find((slot) => slot.id === slotId) || null
  },
  restoreLayout: (layout: TPrintLayout) => {
    set({ pickedLayout: layout })
  },
  setLayoutMode: (mode) => set({ layoutMode: mode }),
  setLayoutForDefault: (layout) => set({ layoutForDefault: layout }),
  getLayoutByLayoutType: (layoutType) => {
    return get().allLayouts.find((layout) => layout.layoutType === layoutType) || null
  },
  pickNoLayout: () => {
    set({ layoutMode: 'no-layout' })
  },
  unpickLayout: () => set({ pickedLayout: null }),
  pickLayout: (layout) => {
    const slotConfigs = layout.slotConfigs.map((slot) => ({
      ...slot,
      placedImage: undefined,
    }))

    set({ pickedLayout: { ...layout, slotConfigs }, layoutMode: 'with-layout' })
  },
  pickFrameLayout: (originalFrameImage) => {
    console.log('>>> [ori] ooo:', originalFrameImage)
    const frameLayout = hardCodedLayoutData('frame-layout')[0]
    set({
      layoutMode: 'frame-layout',
      pickedLayout: {
        ...frameLayout,
        mountType: 'picked',
        slotConfigs: frameLayout.slotConfigs.map((slot) => {
          return {
            ...slot,
            placedImage: {
              id: generateUniqueId(),
              initialHeight: originalFrameImage.height,
              initialWidth: originalFrameImage.width,
              isOriginalFrameImage: true,
              url: originalFrameImage.url,
            },
          }
        }),
      },
    })
  },
  updatePrintedImageInPickedLayout: (layoutId, slotId, placedImage) => {
    const pickedLayout = get().pickedLayout
    if (pickedLayout && pickedLayout.id === layoutId) {
      set({
        pickedLayout: {
          ...pickedLayout,
          slotConfigs: pickedLayout.slotConfigs.map((slot) => {
            if (slot.id === slotId) {
              return {
                ...slot,
                placedImage: {
                  id: placedImage.id,
                  url: placedImage.url,
                  initialWidth: placedImage.width,
                  initialHeight: placedImage.height,
                  isOriginalFrameImage: placedImage.isOriginalImage,
                },
              }
            }
            return slot
          }),
        },
      })
    }
  },
  addPlacedImageToLayout: (layoutId, slotId, placedImage) => {
    const imageToAdd = {
      ...placedImage,
      id: generateUniqueId(),
    }
    const { allLayouts } = get()
    const updatedLayouts = allLayouts.map((layout) => {
      if (layout.id === layoutId) {
        const updatedSlotConfigs = layout.slotConfigs.map((slot) => {
          if (slot.id === slotId) {
            return {
              ...slot,
              placedImage: {
                id: imageToAdd.id,
                url: imageToAdd.url,
                initialWidth: imageToAdd.width,
                initialHeight: imageToAdd.height,
                isOriginalFrameImage: placedImage.isOriginalImage,
              },
            }
          }
          return slot
        })
        return {
          ...layout,
          slotConfigs: updatedSlotConfigs,
        }
      } else {
        return layout
      }
    })
    set({ allLayouts: updatedLayouts })
    get().updatePrintedImageInPickedLayout(layoutId, slotId, imageToAdd)
  },
  resetData: () => {
    set({
      pickedLayout: null,
      allLayouts: hardCodedLayoutData() || [],
      layoutMode: 'with-layout',
    })
  },
  setAllLayouts: (layouts) => set({ allLayouts: layouts }),
  updateLayoutElements: (layoutId, elements) => {
    const { allLayouts } = get()
    const updatedLayouts = allLayouts.map((layout) =>
      layout.id === layoutId ? { ...layout, printedImageElements: elements } : layout
    )
    set({ allLayouts: updatedLayouts })
  },
}))
