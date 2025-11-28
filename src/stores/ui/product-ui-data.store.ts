import {
  TBaseProduct,
  TClientProductVariant,
  TPrintTemplate,
  TProductColor,
  TPrintAreaInfo,
  TProductAttatchedData,
} from '@/utils/types/global'
import { create } from 'zustand'
import { useTemplateStore } from './template.store'

type TProductUIDataStore = {
  pickedProduct: TBaseProduct | null
  pickedVariant: TClientProductVariant | null
  pickedSurface: TBaseProduct['printAreaList'][number] | null
  isAddingToCart: boolean
  cartCount: number
  productsAttachedData: TProductAttatchedData[]

  // Actions
  addProductAttachedData: (data: TProductAttatchedData) => void
  updateProductAttachedData: (
    productId: TBaseProduct['id'],
    data: Partial<TProductAttatchedData>
  ) => void
  addProductNote: (productId: TBaseProduct['id'], note: string) => void
  getProductAttachedData: (productId: TBaseProduct['id']) => TProductAttatchedData | undefined
  handlePickProduct: (prod: TBaseProduct, initialTemplate?: TPrintTemplate) => void
  handlePickVariant: (variant: TClientProductVariant) => void
  handlePickMaterial: (material: string) => void
  handlePickScent: (scent: string) => void
  handlePickColor: (color: TProductColor) => void
  handlePickSize: (selectedColor: TProductColor, size: string) => void
  handlePickVariantSurface: (
    variantId: TClientProductVariant['id'],
    surfaceId: TPrintAreaInfo['id']
  ) => void
  setIsAddingToCart: (isAdding: boolean) => void
  setCartCount: (count: number) => void
  handlePickProductOnRestore: (
    product: TBaseProduct,
    initialTemplate: TPrintTemplate,
    initialVariant: TClientProductVariant,
    initialSurface: TPrintAreaInfo
  ) => void
  resetData: () => void
}

export const useProductUIDataStore = create<TProductUIDataStore>((set, get) => ({
  pickedProduct: null, // dc khởi tạo từ products gallery, restore
  pickedVariant: null, // dc khởi tạo từ products gallery, restore
  pickedSurface: null, // dc khởi tạo từ products gallery, restore
  isAddingToCart: false,
  cartCount: 0,
  productsAttachedData: [],

  resetData: () => {
    set({
      pickedProduct: null,
      pickedVariant: null,
      pickedSurface: null,
      isAddingToCart: false,
      cartCount: 0,
      productsAttachedData: [],
    })
  },

  getProductAttachedData: (productId) => {
    return (get().productsAttachedData || []).find((data) => data.productId === productId)
  },

  addProductAttachedData: (data) => {
    set({ productsAttachedData: [...get().productsAttachedData, data] })
  },

  updateProductAttachedData: (productId, data) => {
    const existingData = [...(get().productsAttachedData || [])]
    if (existingData.length === 0) {
      set({ productsAttachedData: [{ productId, ...data }] })
    } else {
      set({
        productsAttachedData: existingData.map((prev) => {
          if (prev.productId === productId) {
            return { ...prev, ...data }
          }
          return prev
        }),
      })
    }
  },

  addProductNote: (productId, note) => {
    get().updateProductAttachedData(productId, { productNote: note })
  },

  setIsAddingToCart: (isAdding: boolean) => {
    set({ isAddingToCart: isAdding })
  },

  setCartCount: (count: number) => {
    set({ cartCount: count })
  },

  handlePickVariantSurface: (variantId, surfaceId) => {
    const pickedProduct = get().pickedProduct
    if (!pickedProduct) return
    const variant = pickedProduct.variants.find((v) => v.id === variantId)
    const surface = pickedProduct.printAreaList.find((s) => s.id === surfaceId)
    if (variant && surface) {
      set({ pickedSurface: surface, pickedVariant: variant })
    }
  },

  handlePickMaterial: (material) => {
    const currentVariants = get().pickedProduct?.variants || []
    if (currentVariants.length > 0) {
      const variantsForMaterial = currentVariants.filter((v) => v.material === material)
      if (variantsForMaterial.length > 0) {
        get().handlePickVariant(variantsForMaterial[0])
      }
    }
  },

  handlePickScent: (scent) => {
    const currentVariants = get().pickedProduct?.variants || []
    if (currentVariants.length > 0) {
      const variantsForScent = currentVariants.filter((v) => v.scent === scent)
      if (variantsForScent.length > 0) {
        get().handlePickVariant(variantsForScent[0])
      }
    }
  },

  handlePickColor: (color: TProductColor) => {
    const currentVariants = get().pickedProduct?.variants || []
    if (currentVariants.length > 0) {
      const pv = get().pickedVariant
      const variantsForColor = currentVariants.filter(
        (v) =>
          v.color.value === color.value &&
          (!pv?.material || v.material === pv.material) &&
          (!pv?.scent || v.scent === pv.scent)
      )
      if (variantsForColor.length > 0) {
        get().handlePickVariant(variantsForColor[0])
      }
    }
  },

  handlePickSize: (selectedColor: TProductColor, size: string) => {
    const currentVariants = get().pickedProduct?.variants || []
    if (currentVariants.length > 0) {
      const pv = get().pickedVariant
      const variantForSize = currentVariants.find(
        (v) =>
          v.color.value === selectedColor.value &&
          v.size === size &&
          (!pv?.material || v.material === pv.material) &&
          (!pv?.scent || v.scent === pv.scent)
      )
      if (variantForSize) {
        get().handlePickVariant(variantForSize)
      }
    }
  },

  handlePickProductOnRestore: (product, initialTemplate, initialVariant, initialSurface) => {
    console.log('>>> [ddd] handle Pick Product On Restore:', {
      product,
      initialTemplate,
      initialVariant,
      initialSurface,
    })
    set({
      pickedProduct: product,
      pickedVariant: initialVariant,
      pickedSurface: initialSurface,
    })
    useTemplateStore.getState().pickTemplateOnRestore(initialTemplate, initialSurface)
  },

  handlePickProduct: (product, initialTemplate) => {
    set({
      pickedProduct: product,
      pickedVariant: product.variants[0],
      pickedSurface: product.printAreaList[0],
    })
    if (initialTemplate) {
      useTemplateStore.getState().pickTemplate(initialTemplate.id, product.printAreaList[0])
    }
  },

  handlePickVariant: (variant) => {
    set({ pickedVariant: variant })
  },
}))
