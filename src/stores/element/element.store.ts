import { generateUniqueId } from '@/utils/helpers'
import {
  TBaseProduct,
  TClippedElements,
  TElementsVisualState,
  TElementType,
  TPrintedImageVisualState,
  TSelectedElement,
  TStickerVisualState,
  TTextVisualState,
} from '@/utils/types/global'
import { create } from 'zustand'
import { useElementLayerStore } from '../ui/element-layer.store'
import { useLayoutStore } from '../ui/print-layout.store'
import { createInitialConstants } from '@/utils/contants'
import { TLayoutMode } from '@/utils/types/print-layout'

type TSavedElementVisualState = Partial<TElementsVisualState> & {
  productId: TBaseProduct['id']
}

type TUseElementStore = {
  selectedElement: TSelectedElement | null
  stickerElements: TStickerVisualState[]
  textElements: TTextVisualState[]
  printedImages: TPrintedImageVisualState[]
  printedImagesBuildId: string | null
  savedElementsVisualStates: TSavedElementVisualState[]
  clippedElements: TClippedElements

  // Actions
  setElementInClipList: (elementId: string, polygon: string | null) => void
  unselectElement: () => void
  updatePrintedImageElement: (printedImage: Partial<TPrintedImageVisualState>) => void
  updateStickerElement: (sticker: Partial<TStickerVisualState>) => void
  selectElement: (elementId: string, elementType: TElementType, elementURL?: string) => void
  cancelSelectingElement: () => void
  updateSelectedElement: (updatedElement: Partial<TSelectedElement>) => void
  addStickerElement: (stickers: TStickerVisualState[]) => void
  removeStickerElement: (stickerId: string) => void
  addTextElement: (textElements: TTextVisualState[]) => void
  removeTextElement: (textElementId: string) => void
  resetData: (resetAll?: boolean) => void
  setStickerElements: (stickers: TStickerVisualState[]) => void
  setTextElements: (textElements: TTextVisualState[]) => void
  setPrintedImageElements: (printedImages: TPrintedImageVisualState[]) => void
  addPrintedImageElements: (printedImages: TPrintedImageVisualState[]) => void
  removePrintedImageElement: (printedImageId: string) => void
  initBuiltPrintedImageElements: (printedImages: TPrintedImageVisualState[]) => void
  resetPrintedImagesBuildId: () => void
  recoverSavedElementsVisualStates: (productId: TBaseProduct['id']) => void
  checkSavedElementsVisualStateExists: (productId: TBaseProduct['id']) => boolean
  getSavedElementsVisualState: (productId: TBaseProduct['id']) => TSavedElementVisualState | null
  addSavedElementVisualState: (
    productId: TBaseProduct['id'],
    elementVisualState: Omit<TSavedElementVisualState, 'productId'>
  ) => void
  saveEditedStickerElementsState: (elements: TStickerVisualState[]) => void
  saveEditedTextElementsState: (elements: TTextVisualState[]) => void
  saveEditedPrintedImageElementsState: (elements: TPrintedImageVisualState[]) => void
}

export const useEditedElementStore = create<TUseElementStore>((set, get) => ({
  selectedElement: null,
  stickerElements: [],
  textElements: [],
  printedImages: [],
  printedImagesBuildId: null,
  savedElementsVisualStates: [],
  clippedElements: {},

  saveEditedPrintedImageElementsState: (elements) => {
    set({
      printedImages: elements,
    })
  },
  saveEditedStickerElementsState: (elements) => {
    set({ stickerElements: elements })
  },
  saveEditedTextElementsState: (elements) => {
    set({ textElements: elements })
  },
  setElementInClipList: (elementId, polygon) => {
    const { clippedElements } = get()
    set({
      clippedElements: {
        ...clippedElements,
        [elementId]: { polygon },
      },
    })
  },
  unselectElement: () => {
    set({ selectedElement: null })
  },
  updateStickerElement: (sticker) => {
    const { stickerElements } = get()
    const stickerId = sticker.id
    if (!stickerId) return
    set({
      stickerElements: stickerElements.map((st) =>
        st.id === stickerId ? { ...st, ...sticker } : st
      ),
    })
  },
  updatePrintedImageElement: (printedImage) => {
    const { printedImages } = get()
    const printedImageId = printedImage.id
    if (!printedImageId) return
    set({
      printedImages: printedImages.map((img) =>
        img.id === printedImageId ? { ...img, ...printedImage } : img
      ),
    })
  },
  getSavedElementsVisualState: (productId) => {
    const { savedElementsVisualStates } = get()
    return savedElementsVisualStates.find((evs) => evs.productId === productId) || null
  },
  checkSavedElementsVisualStateExists: (productId) => {
    const { savedElementsVisualStates } = get()
    return savedElementsVisualStates.some((evs) => evs.productId === productId)
  },
  addSavedElementVisualState: (productId, elementVisualState) => {
    if (Object.keys(elementVisualState).length === 0) return
    const savedElementsVisualStates = get().savedElementsVisualStates
    if (savedElementsVisualStates.some((evs) => evs.productId === productId)) {
      set({
        savedElementsVisualStates: savedElementsVisualStates.map((evs) =>
          evs.productId === productId ? { ...evs, ...elementVisualState } : evs
        ),
      })
    } else {
      set({
        savedElementsVisualStates: [
          ...savedElementsVisualStates,
          { productId, ...elementVisualState },
        ],
      })
    }
  },
  recoverSavedElementsVisualStates: (productId) => {
    const savedElementsVisualState = get().getSavedElementsVisualState(productId)
    if (!savedElementsVisualState) return
    const printedImages = savedElementsVisualState.printedImages || []
    const stickerElements = savedElementsVisualState.stickers || []
    const textElements = savedElementsVisualState.texts || []
    const storedLayouts = savedElementsVisualState.storedLayouts || []
    const layoutMode =
      savedElementsVisualState.layoutMode ||
      createInitialConstants<TLayoutMode>('DEFAULT_LAYOUT_MODE')
    set({
      printedImages: printedImages.map((img) => ({ ...img, mountType: 'from-saved' })),
      stickerElements: stickerElements.map((sticker) => ({ ...sticker, mountType: 'from-saved' })),
      textElements: textElements.map((text) => ({ ...text, mountType: 'from-saved' })),
    })
    useLayoutStore.getState().restoreLayout(storedLayouts[0])
    useLayoutStore.getState().setLayoutMode(layoutMode)
    useElementLayerStore.getState().addElementLayersOnRestore(
      printedImages
        .map((text) => ({
          elementId: text.id,
          index: text.zindex,
          elementType: 'text' as TElementType,
        }))
        .concat(
          printedImages.map((printedImage) => ({
            elementId: printedImage.id,
            index: printedImage.zindex,
            elementType: 'printed-image' as TElementType,
            isLayoutImage: printedImage.isInitWithLayout,
          }))
        )
        .concat(
          stickerElements.map((sticker) => ({
            elementId: sticker.id,
            index: sticker.zindex,
            elementType: 'sticker' as TElementType,
          }))
        )
    )
  },
  initBuiltPrintedImageElements: (printedImages) => {
    set({
      printedImages: [
        ...get().printedImages.filter((img) => !img.isInitWithLayout),
        ...printedImages,
      ],
    })
  },
  resetPrintedImagesBuildId: () => {
    set({
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
  resetData: (resetAll = false) => {
    if (resetAll) {
      set({
        selectedElement: null,
        stickerElements: [],
        textElements: [],
        printedImages: [],
        printedImagesBuildId: null,
        savedElementsVisualStates: [],
      })
    } else {
      set({
        selectedElement: null,
        stickerElements: [],
        textElements: [],
        printedImages: [],
        printedImagesBuildId: null,
      })
    }
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
