import { TPrintLayout, TLayoutType, TLayoutSlotConfig } from '@/utils/types/print-layout'

export function hardCodedLayoutData(): TPrintLayout[]
export function hardCodedLayoutData(layoutType: TLayoutType): TPrintLayout[]
export function hardCodedLayoutData(layoutType?: TLayoutType): TPrintLayout[] {
  const template1: TPrintLayout = {
    id: 'template-1',
    name: 'Default Template 1',
    layoutType: 'full',
    printedImageElements: [],
    slotConfigs: [{ containerWidth: 1, containerHeight: 1 }],
  }
  const template2: TPrintLayout = {
    id: 'template-2',
    name: 'Default Template 2',
    layoutType: 'half-width',
    printedImageElements: [],
    slotConfigs: [
      { containerWidth: 0.5, containerHeight: 1 },
      { containerWidth: 0.5, containerHeight: 1 },
    ],
  }
  const template3: TPrintLayout = {
    id: 'template-3',
    name: 'Default Template 3',
    layoutType: 'half-height',
    printedImageElements: [],
    slotConfigs: [
      { containerWidth: 1, containerHeight: 0.5 },
      { containerWidth: 1, containerHeight: 0.5 },
    ],
  }
  const template4: TPrintLayout = {
    id: 'template-4',
    name: 'Default Template 4',
    layoutType: '3-left',
    printedImageElements: [],
    slotConfigs: [
      { containerWidth: 0.5, containerHeight: 0.5 }, // small top-left
      { containerWidth: 0.5, containerHeight: 0.5 }, // small bottom-left
      { containerWidth: 0.5, containerHeight: 1 }, // large right
    ],
  }
  const template5: TPrintLayout = {
    id: 'template-5',
    name: 'Default Template 5',
    layoutType: '3-right',
    printedImageElements: [],
    slotConfigs: [
      { containerWidth: 0.5, containerHeight: 1 }, // large left
      { containerWidth: 0.5, containerHeight: 0.5 }, // small top-right
      { containerWidth: 0.5, containerHeight: 0.5 }, // small bottom-right
    ],
  }
  const template6: TPrintLayout = {
    id: 'template-6',
    name: 'Default Template 6',
    layoutType: '3-top',
    printedImageElements: [],
    slotConfigs: [
      { containerWidth: 0.5, containerHeight: 0.5 }, // small top-left
      { containerWidth: 0.5, containerHeight: 0.5 }, // small top-right
      { containerWidth: 1, containerHeight: 0.5 }, // large bottom
    ],
  }
  const template7: TPrintLayout = {
    id: 'template-7',
    name: 'Default Template 7',
    layoutType: '3-bottom',
    printedImageElements: [],
    slotConfigs: [
      { containerWidth: 1, containerHeight: 0.5 }, // large top
      { containerWidth: 0.5, containerHeight: 0.5 }, // small bottom-left
      { containerWidth: 0.5, containerHeight: 0.5 }, // small bottom-right
    ],
  }
  const template8: TPrintLayout = {
    id: 'template-8',
    name: 'Default Template 8',
    layoutType: '4-horizon',
    printedImageElements: [],
    slotConfigs: [
      { containerWidth: 1, containerHeight: 0.25 },
      { containerWidth: 1, containerHeight: 0.25 },
      { containerWidth: 1, containerHeight: 0.25 },
      { containerWidth: 1, containerHeight: 0.25 },
    ],
  }
  const template9: TPrintLayout = {
    id: 'template-9',
    name: 'Default Template 9',
    layoutType: '4-vertical',
    printedImageElements: [],
    slotConfigs: [
      { containerWidth: 0.25, containerHeight: 1 },
      { containerWidth: 0.25, containerHeight: 1 },
      { containerWidth: 0.25, containerHeight: 1 },
      { containerWidth: 0.25, containerHeight: 1 },
    ],
  }
  const template10: TPrintLayout = {
    id: 'template-10',
    name: 'Default Template 10',
    layoutType: '4-square',
    printedImageElements: [],
    slotConfigs: [
      { containerWidth: 0.5, containerHeight: 0.5 },
      { containerWidth: 0.5, containerHeight: 0.5 },
      { containerWidth: 0.5, containerHeight: 0.5 },
      { containerWidth: 0.5, containerHeight: 0.5 },
    ],
  }

  if (layoutType) {
    switch (layoutType) {
      case 'full':
        return [template1]
      case 'half-width':
        return [template2]
      case 'half-height':
        return [template3]
      case '3-left':
        return [template4]
      case '3-right':
        return [template5]
      case '3-top':
        return [template6]
      case '3-bottom':
        return [template7]
      case '4-horizon':
        return [template8]
      case '4-vertical':
        return [template9]
      case '4-square':
        return [template10]
      default:
        return [template1]
    }
  }

  return [
    template1,
    template2,
    template3,
    template4,
    template5,
    template6,
    template7,
    template8,
    template9,
    template10,
  ]
}

export const getSlotConfigs = (layoutType: TLayoutType): TLayoutSlotConfig[] => {
  switch (layoutType) {
    case 'full':
      return hardCodedLayoutData('full')[0].slotConfigs
    case 'half-width':
      return hardCodedLayoutData('half-width')[0].slotConfigs
    case 'half-height':
      return hardCodedLayoutData('half-height')[0].slotConfigs
    case '3-left':
      return hardCodedLayoutData('3-left')[0].slotConfigs
    case '3-right':
      return hardCodedLayoutData('3-right')[0].slotConfigs
    case '3-top':
      return hardCodedLayoutData('3-top')[0].slotConfigs
    case '3-bottom':
      return hardCodedLayoutData('3-bottom')[0].slotConfigs
    case '4-horizon':
      return hardCodedLayoutData('4-horizon')[0].slotConfigs
    case '4-vertical':
      return hardCodedLayoutData('4-vertical')[0].slotConfigs
    case '4-square':
      return hardCodedLayoutData('4-square')[0].slotConfigs
    default:
      return hardCodedLayoutData('full')[0].slotConfigs
  }
}
