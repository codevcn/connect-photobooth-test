import { TElementType, TStickerVisualState, TTextVisualState } from '@/utils/types/global'
import { create } from 'zustand'

type TUseElementStore = {
  selectedElement: {
    elementId: string
    rootElement: HTMLElement
    elementType: TElementType
    elementURL?: string
  } | null
  stickerElements: TStickerVisualState[]
  textElements: TTextVisualState[]

  // Actions
  selectElement: (
    elementId: string,
    rootElement: HTMLElement,
    elementType: TElementType,
    elementURL?: string
  ) => void
  cancelSelectingElement: () => void
  addStickerElement: (sticker: TStickerVisualState) => void
  removeStickerElement: (stickerId: string) => void
  addTextElement: (textElement: TTextVisualState) => void
  removeTextElement: (textElementId: string) => void
}

export const useEditedElementStore = create<TUseElementStore>((set, get) => ({
  selectedElement: null,
  stickerElements: [],
  textElements: [],

  addTextElement: (textElement) => {
    const { textElements } = get()
    set({ textElements: [...textElements, textElement] })
  },
  removeTextElement: (textElementId) => {
    const { textElements, selectedElement } = get()
    // Chỉ set selectedElement = null nếu text element đang xóa chính là element đang được chọn
    const shouldClearSelection = selectedElement?.elementId === textElementId
    set({
      textElements: textElements.filter((textElement) => textElement.id !== textElementId),
      ...(shouldClearSelection && { selectedElement: null }),
    })
  },
  addStickerElement: (sticker) => {
    const { stickerElements } = get()
    set({ stickerElements: [...stickerElements, sticker] })
  },
  removeStickerElement: (stickerId) => {
    const { stickerElements, selectedElement } = get()
    // Chỉ set selectedElement = null nếu sticker đang xóa chính là sticker đang được chọn
    const shouldClearSelection = selectedElement?.elementId === stickerId
    set({
      stickerElements: stickerElements.filter((sticker) => sticker.id !== stickerId),
      ...(shouldClearSelection ? { selectedElement: null } : {}),
    })
  },
  selectElement: (elementId, rootElement, elementType, elementURL) => {
    set({ selectedElement: { rootElement, elementType, elementId, elementURL } })
  },
  cancelSelectingElement: () => {
    set({ selectedElement: null })
  },
}))
