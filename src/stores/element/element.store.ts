import { generateUniqueId } from '@/utils/helpers'
import {
  TElementType,
  TPrintedImageVisualState,
  TStickerVisualState,
  TTextVisualState,
} from '@/utils/types/global'
import { create } from 'zustand'

type TSelectedElement = {
  elementId: string
  elementType: TElementType
  elementURL?: string
}

type TUseElementStore = {
  selectedElement: TSelectedElement | null
  stickerElements: TStickerVisualState[]
  textElements: TTextVisualState[]
  printedImages: TPrintedImageVisualState[]
  printedImagesBuildId: string | null

  // Actions
  selectElement: (elementId: string, elementType: TElementType, elementURL?: string) => void
  cancelSelectingElement: () => void
  updateSelectedElement: (updatedElement: Partial<TSelectedElement>) => void
  addStickerElement: (stickers: TStickerVisualState[]) => void
  removeStickerElement: (stickerId: string) => void
  addTextElement: (textElements: TTextVisualState[]) => void
  removeTextElement: (textElementId: string) => void
  resetData: () => void
  setStickerElements: (stickers: TStickerVisualState[]) => void
  setTextElements: (textElements: TTextVisualState[]) => void
  setPrintedImageElements: (printedImages: TPrintedImageVisualState[]) => void
  addPrintedImageElements: (printedImages: TPrintedImageVisualState[]) => void
  removePrintedImageElement: (printedImageId: string) => void
  initBuiltPrintedImageElements: (printedImages: TPrintedImageVisualState[]) => void
}

export const useEditedElementStore = create<TUseElementStore>((set, get) => ({
  selectedElement: null,
  stickerElements: [],
  textElements: [],
  printedImages: [],
  printedImagesBuildId: null,

  initBuiltPrintedImageElements: (printedImages) => {
    set({
      printedImages,
      printedImagesBuildId: generateUniqueId(),
    })
  },
  removePrintedImageElement: (printedImageId) => {
    const { printedImages, selectedElement } = get()
    // Chỉ set selectedElement = null nếu printed image đang xóa chính là printed image đang được chọn
    const shouldClearSelection = selectedElement?.elementId === printedImageId
    set({
      printedImages: printedImages.filter((printedImage) => printedImage.id !== printedImageId),
      ...(shouldClearSelection ? { selectedElement: null } : {}),
    })
  },
  setPrintedImageElements: (printedImages) => {
    set({ printedImages })
  },
  addPrintedImageElements: (printedImages) => {
    const { printedImages: existingPrintedImages } = get()
    set({ printedImages: [...existingPrintedImages, ...printedImages] })
  },
  setStickerElements: (stickers) => {
    set({ stickerElements: stickers })
  },
  setTextElements: (textElements) => {
    set({ textElements })
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
      printedImages: [],
      printedImagesBuildId: null,
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
  selectElement: (elementId, elementType, elementURL) => {
    set({ selectedElement: { elementType, elementId, elementURL } })
  },
  cancelSelectingElement: () => {
    set({ selectedElement: null })
  },
}))
