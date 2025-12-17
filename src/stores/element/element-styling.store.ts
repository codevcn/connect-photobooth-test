import { initAllSupportedFonts } from '@/configs/fonts/fonts'
import { TTextFont, TLoadFontStatus } from '@/utils/types/global'
import { create } from 'zustand'

type TUseElementStylingStore = {
  allLoadedFonts: TTextFont[]
  status: TLoadFontStatus

  setLoadedFonts: (fonts: TTextFont[]) => void
  addFont: (font: TTextFont) => void
  checkIfFontLoaded: (fontFamily: TTextFont['fontFamily']) => boolean
  setStatus: (status: TLoadFontStatus) => void
  resetData: () => void
  sortLoadedFontsByCommon: () => void
}

export const useElementStylingStore = create<TUseElementStylingStore>((set, get) => ({
  allLoadedFonts: [],
  status: 'idle',

  resetData: () => {
    set({ allLoadedFonts: [], status: 'idle' })
  },
  sortLoadedFontsByCommon: () => {
    const base = initAllSupportedFonts()
    const currentFonts = get().allLoadedFonts
    
    // Tạo map để tra cứu index của mỗi font trong base config
    const orderMap = new Map<string, number>()
    base.forEach((font, index) => {
      orderMap.set(font.fontFamily, index)
    })
    
    // Sắp xếp fonts theo thứ tự trong config
    const sorted = [...currentFonts].sort((a, b) => {
      const indexA = orderMap.get(a.fontFamily) ?? Infinity
      const indexB = orderMap.get(b.fontFamily) ?? Infinity
      return indexA - indexB
    })
    
    set({ allLoadedFonts: sorted })
  },
  setStatus: (status: TLoadFontStatus) => {
    set({ status })
  },
  setLoadedFonts: (fonts: TTextFont[]) => {
    set({ allLoadedFonts: fonts })
  },
  addFont: (font: TTextFont) => {
    const allLoadedFonts = get().allLoadedFonts
    if (!get().checkIfFontLoaded(font.fontFamily)) {
      set({ allLoadedFonts: [...allLoadedFonts, font] })
    }
  },
  checkIfFontLoaded: (fontFamily: TTextFont['fontFamily']) => {
    return get().allLoadedFonts.some((f) => f.fontFamily === fontFamily)
  },
}))
