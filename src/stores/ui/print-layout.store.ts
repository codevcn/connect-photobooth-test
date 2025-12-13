import { hardCodedLayoutData } from '@/configs/print-layout/print-layout-data-Fun'
import { generateUniqueId } from '@/utils/helpers'
import { TPrintedImage, TPrintedImageVisualState } from '@/utils/types/global'
import { TPrintLayout } from '@/utils/types/print-layout'
import { create } from 'zustand'

type TLayoutStore = {
  pickedLayout: TPrintLayout | null
  allLayouts: TPrintLayout[]
  layoutMode: 'with-layout' | 'no-layout'

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
}

export const useLayoutStore = create<TLayoutStore>((set, get) => ({
  pickedLayout: null,
  allLayouts: new URLSearchParams(window.location.search).get('funstudio')
    ? hardCodedLayoutData()
    : [],
  layoutMode: 'with-layout',

  updatePrintedImageInPickedLayout: (layoutId, slotId, printedImage) => {
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
                  id: printedImage.id,
                  url: printedImage.url,
                  initialWidth: printedImage.width,
                  initialHeight: printedImage.height,
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
  pickNoLayout: () => {
    set({ layoutMode: 'no-layout', pickedLayout: null })
  },
  unpickLayout: () => set({ pickedLayout: null }),
  pickLayout: (layout) => {
    set({ pickedLayout: layout })
    const pickedLayout = get().pickedLayout
    if (!pickedLayout) return
    const slotConfigs = pickedLayout.slotConfigs.map((slot) => ({
      ...slot,
      placedImage: undefined,
    }))

    set({ pickedLayout: { ...pickedLayout, slotConfigs } })
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
