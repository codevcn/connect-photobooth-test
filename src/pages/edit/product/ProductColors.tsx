import { CustomScrollbar } from '@/components/custom/CustomScrollbar'
import { getContrastColor } from '@/utils/helpers'
import { TMergedAttributes } from '@/utils/types/global'
import { useMemo } from 'react'

type ProductColorsProps = {
  colorsCount: number
  mergedAttributes: TMergedAttributes
  selectedAttributes: Record<string, string>
  pickColor: (isDisabled: boolean, color: string) => void
}

export const ProductColors = ({
  colorsCount,
  mergedAttributes,
  selectedAttributes,
  pickColor,
}: ProductColorsProps) => {
  type RGB = { r: number; g: number; b: number }

  const clamp255 = (n: number) => Math.max(0, Math.min(255, n))

  const parseHexToRgb = (input: string): RGB | null => {
    if (!input) return null
    let hex = input.trim().replace(/^#/, '')

    // #RGB
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('')
    }

    // #RRGGBB
    if (hex.length !== 6) return null
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null

    const n = parseInt(hex, 16)
    return {
      r: clamp255((n >> 16) & 0xff),
      g: clamp255((n >> 8) & 0xff),
      b: clamp255(n & 0xff),
    }
  }

  // Relative luminance theo chuẩn WCAG (0..1), càng lớn càng sáng
  const luminance = ({ r, g, b }: RGB): number => {
    const toLinear = (v255: number) => {
      const v = v255 / 255
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    }

    const R = toLinear(r)
    const G = toLinear(g)
    const B = toLinear(b)

    return 0.2126 * R + 0.7152 * G + 0.0722 * B
  }

  /**
   * Sort danh sách keys màu theo sáng dần.
   * @param colorKeys Ví dụ: ["Red", "Blue", ...]
   * @param colorMap Ví dụ: { Red: "#ff0000", Blue: "#0000ff" }
   */
  const sortColorsByBrightnessAsc = (
    colorKeys: string[],
    colorMap: Record<string, string | undefined>
  ): string[] => {
    return colorKeys
      .map((key, idx) => {
        const hex = colorMap[key]
        const rgb = hex ? parseHexToRgb(hex) : null
        const lum = rgb ? luminance(rgb) : Number.POSITIVE_INFINITY
        return { key, idx, lum }
      })
      .sort((a, b) => a.lum - b.lum || a.idx - b.idx) // stable
      .map((x) => x.key)
  }

  const sortedColors = useMemo(
    () =>
      sortColorsByBrightnessAsc(
        Object.keys(mergedAttributes.uniqueColors),
        mergedAttributes.uniqueColors
      ),
    [mergedAttributes.uniqueColors]
  )

  return (
    colorsCount > 0 &&
    Object.keys(mergedAttributes.uniqueColors)[0] !== 'null' && (
      <div className="NAME-color-variant-section mb-4">
        <h3 className="5xl:text-[0.5em] text-sm text-slate-800 font-bold mb-2">
          <span>{mergedAttributes.uniqueColorTitles[0]}</span>
          <span className="5xl:text-[0.9em] text-xs"> ({selectedAttributes.color})</span>
        </h3>
        <CustomScrollbar
          showScrollbar={colorsCount > 0}
          dataToRerender={colorsCount}
          classNames={{
            container:
              '5xl:text-[0.4em] smd:text-base text-sm font-bold py-2 w-full overflow-x-hidden',
            content: '5xl:gap-6 flex flex-nowrap gap-3 overflow-x-auto no-scrollbar p-1 pb-2',
          }}
        >
          {sortedColors.map((color) => {
            const isSelected = selectedAttributes.color === color
            const material = selectedAttributes.material ?? 'null'
            const scent = selectedAttributes.scent ?? 'null'
            const isDisabled = !mergedAttributes.groups?.[material]?.[scent]?.[color]
            if (mergedAttributes.uniqueColors[color]) {
              // Case 1: Display color swatch with hex
              return (
                <button
                  key={color}
                  onClick={() => pickColor(isDisabled, color)}
                  disabled={isDisabled}
                  className={`5xl:py-2 flex flex-col items-center rounded-full focus:outline-none transition active:scale-90 ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={color}
                >
                  <div
                    style={{ backgroundColor: mergedAttributes.uniqueColors[color] }}
                    className={`${
                      isDisabled
                        ? 'ring-1 ring-gray-300 ring-offset-2 grayscale'
                        : isSelected
                        ? 'ring-2 ring-main-cl ring-offset-2 shadow-lg'
                        : 'ring-1 ring-gray-300 ring-offset-2 hover:ring-secondary-cl hover:shadow-md'
                    } 5xl:h-14 5xl:w-14 h-10 w-10 rounded-full`}
                  >
                    {isSelected && !isDisabled && (
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 drop-shadow-lg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          strokeWidth="3"
                          style={{
                            color: getContrastColor(mergedAttributes.uniqueColors[color]) || '#000',
                          }}
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* <div
                      className={`rounded-md py-0.5 px-1.5 mt-2 inline-block w-max ${
                        isDisabled ? 'grayscale' : ''
                      }`}
                      style={{
                        backgroundColor: mergedAttributes.uniqueColors[color],
                        color: getContrastColor(mergedAttributes.uniqueColors[color]) || '#000',
                      }}
                    >
                      {color}
                    </div> */}
                </button>
              )
            } else {
              // Case 2: Display as label (no hex)
              return (
                <button
                  key={color}
                  onClick={() => pickColor(isDisabled, color)}
                  disabled={isDisabled}
                  className={`5xl:py-2 px-2 py-1 font-bold rounded-lg transition-all mobile-touch ${
                    isDisabled
                      ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                      : isSelected
                      ? 'bg-main-cl border-2 border-main-cl text-white shadow-md'
                      : 'bg-white border-2 border-gray-300 text-slate-700 hover:border-secondary-cl hover:text-secondary-cl'
                  }`}
                >
                  {color}
                </button>
              )
            }
          })}
        </CustomScrollbar>
      </div>
    )
  )
}
