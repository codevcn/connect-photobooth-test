import { useCallback } from 'react'
import { TTextFont } from '@/utils/types/global'
import { useElementStylingStore } from '@/stores/element/element-styling.store'
import { generateIdForFont, injectFontToDocumentHead } from '@/utils/helpers'

const initFallbackFonts = (): TTextFont[] => [
  {
    fontFamily: 'Be Vietnam Pro',
    loadFontURL: '/fonts/Be_Vietnam_Pro/BeVietnamPro-Regular.ttf',
    fontStyle: 'normal',
    fontWeight: '400',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
  },
  {
    fontFamily: 'Cormorant Garamond',
    loadFontURL: '/fonts/Cormorant_Garamond/static/CormorantGaramond-Regular.ttf',
    fontStyle: 'normal',
    fontWeight: '400',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
  },
  {
    fontFamily: 'Dancing Script',
    loadFontURL: '/fonts/Dancing_Script/static/DancingScript-Regular.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
  {
    fontFamily: 'Lora',
    loadFontURL: '/fonts/Lora/static/Lora-Regular.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
  {
    fontFamily: 'Montserrat',
    loadFontURL: '/fonts/Montserrat/static/Montserrat-Regular.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
  {
    fontFamily: 'Phudu',
    loadFontURL: '/fonts/Phudu/static/Phudu-Regular.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
  {
    fontFamily: 'Playfair Display',
    loadFontURL: '/fonts/Playfair_Display/static/PlayfairDisplay-Regular.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
  {
    fontFamily: 'Roboto',
    loadFontURL: '/fonts/Roboto/static/Roboto-Regular.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
  {
    fontFamily: 'Saira Stencil One',
    loadFontURL: '/fonts/Saira_Stencil_One/SairaStencilOne-Regular.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
  {
    fontFamily: 'Amatic SC',
    loadFontURL: '/fonts/Amatic_SC/AmaticSC-Regular.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
  {
    fontFamily: 'Bitcount',
    loadFontURL: '/fonts/Bitcount/static/Bitcount-Regular.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
  {
    fontFamily: 'Bungee Outline',
    loadFontURL: '/fonts/Bungee_Outline/BungeeOutline-Regular.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
  {
    fontFamily: 'Bungee Spice',
    loadFontURL: '/fonts/Bungee_Spice/BungeeSpice-Regular.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
  {
    fontFamily: 'Creepster',
    loadFontURL: '/fonts/Creepster/Creepster-Regular.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
  {
    fontFamily: 'Emilys Candy',
    loadFontURL: '/fonts/Emilys_Candy/EmilysCandy-Regular.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
  {
    fontFamily: 'Honk',
    loadFontURL: '/fonts/Honk/Honk-Regular-VariableFont_MORF,SHLN.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
  {
    fontFamily: 'Jersey 25 Charted',
    loadFontURL: '/fonts/Jersey_25_Charted/Jersey25Charted-Regular.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
  {
    fontFamily: 'Nosifer',
    loadFontURL: '/fonts/Nosifer/Nosifer-Regular.ttf',
    fontDisplay: 'swap',
    fontFormat: 'truetype',
    fontStyle: 'normal',
    fontWeight: '400',
  },
]

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
    async (initFonts: TTextFont[] = initFallbackFonts()) => {
      if (!initFonts) {
        throw new Error('Không có font khởi tạo để tải')
      }
      setFontLoadStatus('loading')

      try {
        await Promise.allSettled(initFonts.map((font) => loadFont(font, font.loadFontURL)))

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
