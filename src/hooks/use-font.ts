import { useCallback } from 'react'
import { TTextFont } from '@/utils/types/global'
import { useElementStylingStore } from '@/stores/element/element-styling.store'
import { generateIdForFont, injectFontToDocumentHead } from '@/utils/helpers'
import { initAllSupportedFonts } from '@/configs/fonts/fonts'

export const useFontLoader = () => {
  const allLoadedFonts = useElementStylingStore((state) => state.allLoadedFonts)
  const checkIfFontLoaded = useElementStylingStore((state) => state.checkIfFontLoaded)
  const addFont = useElementStylingStore((state) => state.addFont)
  const fontLoadStatus = useElementStylingStore((state) => state.status)
  const setFontLoadStatus = useElementStylingStore((state) => state.setStatus)
  /**
   * Hàm này sau khi thực thi thành công sẽ cho phép element sử dụng ngay lập tức font.
   * Font đã được thêm vào document.fonts và sẵn sàng để render text với font này
   */
  const loadFont = useCallback(async (font: TTextFont, url: string) => {
    // Chặn load trùng
    if (checkIfFontLoaded(font.fontFamily)) return

    setFontLoadStatus('loading')

    try {
      const fontFace = new FontFace(font.fontFamily, `url(${url})`)

      // Load file
      const loaded = await fontFace.load()

      // Add vào document.fonts
      document.fonts.add(loaded)

      // Inject font vào head để khi chuyển html sang image vẫn giữ được font
      injectFontToDocumentHead(
        generateIdForFont(font.fontFamily, font.fontWeight),
        font.fontFamily,
        font.fontWeight,
        url,
        font.fontFormat,
        font.fontStyle,
        font.fontDisplay
      )

      // Đánh dấu đã load
      addFont(font)

      setFontLoadStatus('loaded')
    } catch (err) {
      console.error('>>> Failed to load font:', err)
      setFontLoadStatus('error')
      throw err
    }
  }, [])

  const loadAllFonts = useCallback(
    async (initFonts: TTextFont[] = initAllSupportedFonts()) => {
      if (!initFonts) {
        throw new Error('Không có font khởi tạo để tải')
      }
      setFontLoadStatus('loading')

      try {
        // Priority 1: Fonts phổ biến nhất, cần thiết ngay lập tức
        const priority1 = initFonts.slice(0, 6) // Be Vietnam Pro -> Cormorant Garamond
        await Promise.allSettled(priority1.map((font) => loadFont(font, font.loadFontURL)))

        // Priority 2: Fonts thông dụng, xu hướng mới
        const priority2 = initFonts.slice(6, 15) // Space Mono -> VT323
        await Promise.allSettled(priority2.map((font) => loadFont(font, font.loadFontURL)))

        // Priority 3: Fonts chuyên dụng, ít dùng hơn
        const priority3 = initFonts.slice(15) // Amatic SC -> Syne
        await Promise.allSettled(priority3.map((font) => loadFont(font, font.loadFontURL)))

        useElementStylingStore.getState().sortLoadedFontsByCommon()
        setFontLoadStatus('loaded')
      } catch (err) {
        console.error('>>> Failed to load all fonts:', err)
        setFontLoadStatus('error')
      }
    },
    [loadFont]
  )

  return { fontLoadStatus, loadFont, loadAllFonts, allLoadedFonts }
}
