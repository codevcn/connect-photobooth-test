import { createInitialConstants } from '@/utils/contants'
import { generateUniqueId } from '@/utils/helpers'
import { TPrintedImage, TPrintedImageVisualState, TSizeInfo } from '@/utils/types/global'

// ============================================================================
// Types & Interfaces
// ============================================================================

type LayoutType = 'full' | 'half-width' | 'half-height'

interface LayoutDimensions {
  width: number
  height: number
}

interface FittedImage {
  dimensions: LayoutDimensions
  matchOrientation: 'width' | 'height'
}

interface LayoutStrategy {
  type: LayoutType
  imageCount: number
  calculateSlotDimensions: (printArea: LayoutDimensions) => LayoutDimensions
}

interface LayoutResult {
  type: LayoutType
  states: TPrintedImageVisualState[]
  efficiency: number // 0-1, higher is better
}

// ============================================================================
// Layout Strategies Configuration
// ============================================================================

const LAYOUT_STRATEGIES: LayoutStrategy[] = [
  {
    type: 'full',
    imageCount: 1,
    calculateSlotDimensions: (printArea) => printArea,
  },
  {
    type: 'half-width',
    imageCount: 2,
    calculateSlotDimensions: (printArea) => ({
      width: printArea.width / 2,
      height: printArea.height,
    }),
  },
  {
    type: 'half-height',
    imageCount: 2,
    calculateSlotDimensions: (printArea) => ({
      width: printArea.width,
      height: printArea.height / 2,
    }),
  },
]

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Fit an image into a slot while maintaining aspect ratio
 */
const fitImageToSlot = (image: TPrintedImage, slot: LayoutDimensions): FittedImage => {
  const imgRatio = image.width / image.height
  const slotRatio = slot.width / slot.height

  if (imgRatio > slotRatio) {
    // Fit by width
    return {
      dimensions: {
        width: slot.width,
        height: slot.width / imgRatio,
      },
      matchOrientation: 'width',
    }
  } else {
    // Fit by height
    return {
      dimensions: {
        width: slot.height * imgRatio,
        height: slot.height,
      },
      matchOrientation: 'height',
    }
  }
}

/**
 * Calculate layout efficiency (how much of the print area is used)
 */
const calculateEfficiency = (usedArea: number, totalArea: number): number => {
  return usedArea / totalArea
}

/**
 * Create a visual state object for a printed image
 */
const createImageVisualState = (
  image: TPrintedImage,
  dimensions: LayoutDimensions,
  matchOrientation: 'width' | 'height'
): TPrintedImageVisualState => {
  return {
    id: generateUniqueId(),
    path: image.url,
    position: { x: 0, y: 0 }, // Will be set by arrange function
    angle: createInitialConstants<number>('ELEMENT_ROTATION'),
    scale: createInitialConstants<number>('ELEMENT_ZOOM'),
    zindex: createInitialConstants<number>('ELEMENT_ZINDEX'),
    mountType: 'from-template',
    width: dimensions.width,
    height: dimensions.height,
    matchOrientation,
  }
}

/**
 * Evaluate a layout strategy for a given image
 */
const evaluateLayoutStrategy = (
  strategy: LayoutStrategy,
  image: TPrintedImage,
  printArea: LayoutDimensions
): LayoutResult => {
  const slotDimensions = strategy.calculateSlotDimensions(printArea)
  const fittedImage = fitImageToSlot(image, slotDimensions)

  const usedArea =
    fittedImage.dimensions.width * fittedImage.dimensions.height * strategy.imageCount
  const totalArea = printArea.width * printArea.height
  const efficiency = calculateEfficiency(usedArea, totalArea)

  const states = Array.from({ length: strategy.imageCount }, () =>
    createImageVisualState(image, fittedImage.dimensions, fittedImage.matchOrientation)
  )

  return {
    type: strategy.type,
    states,
    efficiency,
  }
}

/**
 * Select the best layout from all available images and strategies
 */
const selectBestLayout = (printArea: LayoutDimensions, images: TPrintedImage[]): LayoutResult => {
  let bestLayout: LayoutResult | null = null

  for (const image of images) {
    for (const strategy of LAYOUT_STRATEGIES) {
      const layout = evaluateLayoutStrategy(strategy, image, printArea)

      if (!bestLayout || layout.efficiency > bestLayout.efficiency) {
        bestLayout = layout
      }
    }
  }

  if (!bestLayout) {
    throw new Error('No valid layout found')
  }

  return bestLayout
}

// ============================================================================
// Positioning Functions
// ============================================================================

interface PositionCalculator {
  (state: TPrintedImageVisualState, index: number, allowedPrintArea: HTMLElement): {
    x: number
    y: number
  }
}

const POSITION_CALCULATORS: Record<LayoutType, PositionCalculator> = {
  full: (state, index, area) => {
    if (state.matchOrientation === 'width') {
      return {
        x: area.offsetLeft,
        y: area.offsetTop + area.offsetHeight / 2 - state.height! / 2,
      }
    } else {
      return {
        x: area.offsetLeft + area.offsetWidth / 2 - state.width! / 2,
        y: area.offsetTop,
      }
    }
  },

  'half-width': (state, index, area) => {
    const xOffset = index * state.width!
    return {
      x: area.offsetLeft + xOffset,
      y: area.offsetTop + area.offsetHeight / 2 - state.height! / 2,
    }
  },

  'half-height': (state, index, area) => {
    const yOffset = index * state.height!
    return {
      x: area.offsetLeft + area.offsetWidth / 2 - state.width! / 2,
      y: area.offsetTop + yOffset,
    }
  },
}

/**
 * Position images according to the layout type
 */
const positionImages = (
  layoutType: LayoutType,
  states: TPrintedImageVisualState[],
  allowedPrintArea: HTMLElement
): void => {
  const calculator = POSITION_CALCULATORS[layoutType]

  states.forEach((state, index) => {
    state.position = calculator(state, index, allowedPrintArea)
  })
}

// ============================================================================
// Main Export Function
// ============================================================================

export const buildDefaultTemplateLayout = (
  printAreaContainer: HTMLElement,
  allowedPrintArea: HTMLElement,
  printedImages: TPrintedImage[]
): TPrintedImageVisualState[] => {
  if (printedImages.length === 0) {
    return []
  }

  const printAreaRect = allowedPrintArea.getBoundingClientRect()
  const printArea: LayoutDimensions = {
    width: printAreaRect.width,
    height: printAreaRect.height,
  }

  // Select best layout
  const bestLayout = selectBestLayout(printArea, printedImages)

  // Position images
  positionImages(bestLayout.type, bestLayout.states, allowedPrintArea)

  console.log(
    `[Layout] Type: ${bestLayout.type}, Efficiency: ${(bestLayout.efficiency * 100).toFixed(2)}%`
  )

  return bestLayout.states
}

// ============================================================================
// Extension Examples
// ============================================================================

/*
// To add a new layout type, just add to LAYOUT_STRATEGIES:
{
  type: 'quarter',
  imageCount: 4,
  calculateSlotDimensions: (printArea) => ({
    width: printArea.width / 2,
    height: printArea.height / 2,
  }),
}

// And add to POSITION_CALCULATORS:
quarter: (state, index, area) => {
  const col = index % 2
  const row = Math.floor(index / 2)
  return {
    x: area.offsetLeft + col * state.width!,
    y: area.offsetTop + row * state.height!,
  }
}
*/
