import {
  TBaseProduct,
  TClientProductVariant,
  TPrintTemplate,
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
    const { pickedProduct, pickedSurface } = get()
    if (!pickedProduct || !pickedSurface) {
      set({ pickedVariant: variant })
      return
    }

    // Tìm mockup tương ứng với variant + surface để lấy dynamic transform
    const mockup = pickedProduct.variantSurfaces.find(
      (vs) => vs.variantId === variant.id && vs.surfaceId === pickedSurface.id
    )

    // Nếu có transform động, cập nhật print area
    if (mockup && mockup.transform && Object.keys(mockup.transform).length > 0) {
      const { transform } = mockup
      const updatedSurface: TPrintAreaInfo = {
        ...pickedSurface,
        area: {
          printX: transform.x_px ?? pickedSurface.area.printX,
          printY: transform.y_px ?? pickedSurface.area.printY,
          printW: transform.width_px ?? pickedSurface.area.printW,
          printH: transform.height_px ?? pickedSurface.area.printH,
          widthRealPx: transform.width_real_px ?? pickedSurface.area.widthRealPx,
          heightRealPx: transform.height_real_px ?? pickedSurface.area.heightRealPx,
        },
      }
      set({ pickedVariant: variant, pickedSurface: updatedSurface })
    } else {
      set({ pickedVariant: variant })
    }
  },
}))
