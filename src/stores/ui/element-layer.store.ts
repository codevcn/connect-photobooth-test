import { createInitialConstants } from '@/utils/contants'
import { TElementLayerState } from '@/utils/types/global'
import { create } from 'zustand'

const ELEMENT_ZINDEX_STEP = createInitialConstants<number>('ELEMENT_ZINDEX_STEP')

type TUseElementLayerStore = {
  elementLayers: TElementLayerState[] // min index is ELEMENT_ZINDEX_STEP

  addElementLayers: (elementLayers: TElementLayerState[]) => void
  removeElementLayers: (elementIds: string[]) => void
  updateElementLayerIndex: (elementId: string, amount: number) => void
  setupElementLayersIndex: (elementLayers: TElementLayerState[]) => void
  initElementLayersWithIndex: (elementLayers: TElementLayerState[]) => void
  resetData: () => void
  removeImageLayoutElements: () => void
  addLayoutImageLayers: (layoutImageLayers: TElementLayerState[]) => void
  addElementLayersOnRestore: (newElementLayers: TElementLayerState[]) => void
}

export const useElementLayerStore = create<TUseElementLayerStore>((set, get) => ({
  elementLayers: [],

  removeImageLayoutElements: () => {
    set({
      elementLayers: get().elementLayers.filter(
        (el) => !(el.isLayoutImage && el.elementType === 'printed-image')
      ),
    })
  },
  resetData: () => {
    set({ elementLayers: [] })
  },
  addElementLayersOnRestore: (newElementLayers) => {
    const layersToRestore = [...newElementLayers]

    // Sắp xếp: layoutImage ở dưới cùng (index thấp nhất)
    const layoutImageLayers = layersToRestore.filter((layer) => layer.isLayoutImage)
    layoutImageLayers.sort((a, b) => a.index - b.index)
    const normalLayers = layersToRestore.filter((layer) => !layer.isLayoutImage)
    normalLayers.sort((a, b) => a.index - b.index)

    set({ elementLayers: [...layoutImageLayers, ...normalLayers] })
  },
  addLayoutImageLayers: (layers) => {
    const { elementLayers } = get()
    const layersToAdd = [...layers]
    // Sắp xếp: layoutImage ở dưới cùng (index thấp nhất)
    const layoutImageLayers = elementLayers
      .filter((layer) => layer.isLayoutImage)
      .concat(layersToAdd)
    const normalLayers = elementLayers.filter((layer) => !layer.isLayoutImage)

    // Gán lại index: layoutImage có index thấp hơn
    let currentIndex = 1
    for (const layer of layoutImageLayers) {
      layer.index = currentIndex * ELEMENT_ZINDEX_STEP
      currentIndex++
    }
    for (const layer of normalLayers) {
      layer.index = currentIndex * ELEMENT_ZINDEX_STEP
      currentIndex++
    }

    console.log('>>> [idx] addLayoutImageLayers:', layersToAdd)
    set({ elementLayers: [...layoutImageLayers, ...normalLayers] })
  },
  addElementLayers: (newElementLayers) => {
    const { elementLayers } = get()
    const layersToAdd = [...newElementLayers]

    if (elementLayers.some((el) => layersToAdd.some((newEl) => newEl.elementId === el.elementId))) {
      return
    }

    let updatedLayers: TElementLayerState[]
    if (elementLayers.length > 0) {
      const maxIndex = Math.max(...elementLayers.map((layer) => layer.index))
      let index = 1
      for (const layer of layersToAdd) {
        layer.index = maxIndex + index * ELEMENT_ZINDEX_STEP
        index++
      }
      console.log('>>> [idx] layersToAdd 1:', layersToAdd)
      updatedLayers = [...elementLayers, ...layersToAdd]
    } else {
      let index = 1
      for (const layer of layersToAdd) {
        layer.index = index * ELEMENT_ZINDEX_STEP
        index++
      }
      console.log('>>> [idx] layersToAdd 2:', layersToAdd)
      updatedLayers = layersToAdd
    }

    set({ elementLayers: updatedLayers })
  },
  removeElementLayers: (elementIds) => {
    set({
      elementLayers: get().elementLayers.filter((el) => !elementIds.includes(el.elementId)),
    })
  },
  updateElementLayerIndex: (elementId, amount) => {
    const currentLayers = get().elementLayers

    const currentItem = currentLayers.find((item) => item.elementId === elementId)
    if (!currentItem) {
      console.warn(`Item with id ${elementId} not found`)
      return
    }

    // Sắp xếp items theo index để tìm vị trí
    const sortedItems = [...currentLayers].sort((a, b) => a.index - b.index)
    const currentPosition = sortedItems.findIndex((item) => item.elementId === elementId)

    let updatedLayers: TElementLayerState[]

    if (amount > 0) {
      // Swap với object tiếp theo (đưa lên trên)
      const nextPosition = currentPosition + 1
      if (nextPosition >= sortedItems.length) {
        console.warn('>>> Already at the top position')
        return
      }

      const nextItem = sortedItems[nextPosition]

      // Swap index giữa 2 items
      updatedLayers = currentLayers.map((item) => {
        if (item.elementId === elementId) {
          return { ...item, index: nextItem.index }
        }
        if (item.elementId === nextItem.elementId) {
          return { ...item, index: currentItem.index }
        }
        return item
      })
    } else if (amount < 0) {
      // Swap với object trước đó (đưa xuống dưới)
      const prevPosition = currentPosition - 1
      if (prevPosition < 0) {
        console.warn('>>> Already at the bottom position')
        return
      }

      const prevItem = sortedItems[prevPosition]

      // Swap index giữa 2 items
      updatedLayers = currentLayers.map((item) => {
        if (item.elementId === elementId) {
          return { ...item, index: prevItem.index }
        }
        if (item.elementId === prevItem.elementId) {
          return { ...item, index: currentItem.index }
        }
        return item
      })
    } else {
      // amount === 0, không làm gì
      return
    }

    console.log('>>> [idx] updatedLayers:', updatedLayers)
    set({ elementLayers: updatedLayers })
  },
  // Hàm này khởi tạo/chuẩn hóa index cho các element layers
  // Đảm bảo mỗi layer có index cách nhau ELEMENT_ZINDEX_STEP
  setupElementLayersIndex: (elementLayers) => {
    if (elementLayers.length === 0) {
      return
    }

    // Sort theo index hiện tại để giữ nguyên thứ tự
    const sortedLayers = [...elementLayers].sort((a, b) => a.index - b.index)

    // Gán lại index với khoảng cách đều nhau
    const normalizedLayers = sortedLayers.map((layer, idx) => ({
      ...layer,
      index: (idx + 1) * ELEMENT_ZINDEX_STEP,
    }))

    console.log('>>> [idx] setupElementLayersIndex:', normalizedLayers)
    set({ elementLayers: normalizedLayers })
  },
  initElementLayersWithIndex: (elementLayers) => {
    const { elementLayers: existingLayers } = get()
    const newLayers = [...existingLayers, ...elementLayers]
    newLayers.sort((a, b) => a.index - b.index)
    console.log('>>> [idx] initElementLayersWithIndex:', newLayers)
    set({ elementLayers: newLayers })
  },
}))
