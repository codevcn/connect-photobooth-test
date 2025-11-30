import { createInitialConstants } from '@/utils/contants'
import { TElementLayerState } from '@/utils/types/global'
import { create } from 'zustand'

type TUseElementLayerStore = {
  elementLayers: TElementLayerState[]

  setElementLayers: (elementLayers: TElementLayerState[]) => void
  addToElementLayers: (elementLayer: TElementLayerState) => void
  removeFromElementLayers: (elementId: string[]) => void
  updateElementLayerIndex: (elementId: string, newIndex: number) => void
  resetData: () => void
}

export const useElementLayerStore = create<TUseElementLayerStore>((set) => ({
  elementLayers: [],

  resetData: () => {
    set({ elementLayers: [] })
  },
  setElementLayers: (elementLayers) => set({ elementLayers }),
  addToElementLayers: (newLayer) =>
    set(({ elementLayers }) => {
      if (elementLayers.some((el) => el.elementId === newLayer.elementId)) {
        return { elementLayers }
      }
      return { elementLayers: [...elementLayers, newLayer] }
    }),
  removeFromElementLayers: (elementIds) => {
    set((state) => ({
      elementLayers: state.elementLayers.filter((el) => !elementIds.includes(el.elementId)),
    }))
  },
  updateElementLayerIndex: (elementId, newIndex) => {
    return set((state) => {
      const currentLayers = state.elementLayers
      // Tìm index hiện tại của element
      const currentIndex = currentLayers.findIndex((layer) => layer.elementId === elementId)
      if (currentIndex === -1) return { elementLayers: currentLayers }

      const isMovingUp = newIndex > 0

      // Kiểm tra boundary
      if (isMovingUp && currentIndex === currentLayers.length - 1)
        return { elementLayers: currentLayers } // Đã ở trên cùng
      if (!isMovingUp && currentIndex === 0) return { elementLayers: currentLayers } // Đã ở dưới cùng

      // Tạo mảng mới và swap vị trí
      const updatedLayers = [...currentLayers]
      const targetIndex = currentIndex + (isMovingUp ? 1 : -1)

      // Swap
      const temp = updatedLayers[currentIndex]
      updatedLayers[currentIndex] = updatedLayers[targetIndex]
      updatedLayers[targetIndex] = temp

      // Cập nhật lại index cho tất cả layers
      return {
        elementLayers: updatedLayers.map((layer, idx) => ({
          ...layer,
          index: (idx + 1) * createInitialConstants<number>('ELEMENT_ZINDEX_STEP') + 1,
        })),
      }
    })
  },
}))
