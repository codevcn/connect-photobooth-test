import { TBaseProduct } from '@/utils/types/global'
import { create } from 'zustand'

type TUseProductStore = {
  products: TBaseProduct[]

  setProducts: (products: TBaseProduct[]) => void
  getProductById: (id: TBaseProduct['id']) => TBaseProduct | null
}

export const useProductStore = create<TUseProductStore>((set, get) => ({
  products: [],

  setProducts: (products) => set({ products }),

  getProductById: (id: TBaseProduct['id']) => {
    return get().products.find((product) => product.id === id) || null
  },
}))
