import {
  TElementType,
  TPrintTemplate,
  TStickerVisualState,
  TStoredTemplate,
  TTextVisualState,
} from '@/utils/types/global'
import { create } from 'zustand'

type TSelectedElement = {
  elementId: string
  rootElement: HTMLElement
  elementType: TElementType
  elementURL?: string
}

type TUseElementStore = {
  selectedElement: TSelectedElement | null
  stickerElements: TStickerVisualState[]
  textElements: TTextVisualState[]
  storedTemplate: TStoredTemplate | null
  didSetStoredTemplate: boolean

  // Actions
  selectElement: (
    elementId: string,
    rootElement: HTMLElement,
    elementType: TElementType,
    elementURL?: string
  ) => void
  cancelSelectingElement: () => void
  updateSelectedElement: (updatedElement: Partial<TSelectedElement>) => void
  addStickerElement: (stickers: TStickerVisualState[]) => void
  removeStickerElement: (stickerId: string) => void
  addTextElement: (textElements: TTextVisualState[]) => void
  removeTextElement: (textElementId: string) => void
  resetData: () => void
  setDidSetStoredTemplate: (didSet: boolean) => void
  setStickerElements: (stickers: TStickerVisualState[]) => void
  setTextElements: (textElements: TTextVisualState[]) => void
  setStoredTemplate: (storedTemplate: TStoredTemplate) => void
}

export const useEditedElementStore = create<TUseElementStore>((set, get) => ({
  selectedElement: null,
  stickerElements: [],
  textElements: [],
  storedTemplate: null,
  didSetStoredTemplate: false,

  setStickerElements: (stickers) => {
    set({ stickerElements: stickers })
  },
  setTextElements: (textElements) => {
    set({ textElements })
  },
  setDidSetStoredTemplate: (didSet) => {
    set({ didSetStoredTemplate: didSet })
  },
  setStoredTemplate: (storedTemplate) => {
    set({ storedTemplate })
  },
  updateSelectedElement: (updatedElement) => {
    const { selectedElement } = get()
    if (!selectedElement) return
    set({ selectedElement: { ...selectedElement, ...updatedElement } })
  },
  resetData: () => {
    set({
      selectedElement: null,
      stickerElements: [],
      textElements: [],
      storedTemplate: null,
      didSetStoredTemplate: false,
    })
  },
  addTextElement: (addedTextElements) => {
    const { textElements } = get()
    set({ textElements: [...textElements, ...addedTextElements] })
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
  addStickerElement: (stickers) => {
    const { stickerElements } = get()
    set({ stickerElements: [...stickerElements, ...stickers] })
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
