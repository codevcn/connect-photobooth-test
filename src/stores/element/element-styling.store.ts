import { TTextFont, TLoadFontStatus } from '@/utils/types/global'
import { create } from 'zustand'

type TUseElementStylingStore = {
  allLoadedFonts: TTextFont[]
  status: TLoadFontStatus

  setLoadedFonts: (fonts: TTextFont[]) => void
  addFont: (font: TTextFont) => void
  checkIfFontLoaded: (fontFamily: TTextFont['fontFamily']) => boolean
  setStatus: (status: TLoadFontStatus) => void
}

export const useElementStylingStore = create<TUseElementStylingStore>((set, get) => ({
  allLoadedFonts: [],
  status: 'idle',

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
