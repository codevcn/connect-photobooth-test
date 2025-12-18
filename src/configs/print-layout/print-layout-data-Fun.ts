import { TPrintLayout, TLayoutType, TLayoutSlotConfig } from '@/utils/types/print-layout'

export function hardCodedLayoutData(): TPrintLayout[]
export function hardCodedLayoutData(layoutType: TLayoutType): TPrintLayout[]
export function hardCodedLayoutData(layoutType?: TLayoutType): TPrintLayout[] {
  const template1: TPrintLayout = {
    id: 'template-1',
    name: 'Default Template 1',
    layoutType: 'full',
    printedImageElements: [],
    slotConfigs: [
      {
        id: 'slot-1',
        containerWidth: 1,
        containerHeight: 1,
        style: {
          gridColumn: 'span 1',
        },
      },
    ],
    layoutContainerConfigs: {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(1, 1fr)',
        gridTemplateRows: 'repeat(1, 1fr)',
        height: 'fit-content',
        width: '100%',
        aspectRatio: '1 / 1',
      },
    },
  }
  const template2: TPrintLayout = {
    id: 'template-2',
    name: 'Default Template 2',
    layoutType: '2-horizontal-square',
    printedImageElements: [],
    slotConfigs: [
      {
        id: 'slot-2',
        containerWidth: 1,
        containerHeight: 0.5,
        style: {
          aspectRatio: '1 / 1',
          height: '100%',
        },
      },
      {
        id: 'slot-3',
        containerWidth: 1,
        containerHeight: 0.5,
        style: {
          aspectRatio: '1 / 1',
          height: '100%',
        },
      },
    ],
    layoutContainerConfigs: {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(1, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        placeItems: 'center',
      },
    },
  }
  const template3: TPrintLayout = {
    id: 'template-3',
    name: 'Default Template 3',
    layoutType: '2-vertical-square',
    printedImageElements: [],
    slotConfigs: [
      {
        id: 'slot-4',
        containerWidth: 0.5,
        containerHeight: 1,
        style: {
          aspectRatio: '1 / 1',
          width: '100%',
        },
      },
      {
        id: 'slot-5',
        containerWidth: 0.5,
        containerHeight: 1,
        style: {
          aspectRatio: '1 / 1',
          width: '100%',
        },
      },
    ],
    layoutContainerConfigs: {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(1, 1fr)',
        placeItems: 'center',
      },
    },
  }
  const template10: TPrintLayout = {
    id: 'template-10',
    name: 'Default Template 10',
    layoutType: '4-square',
    printedImageElements: [],
    slotConfigs: [
      {
        id: 'slot-10-1',
        containerWidth: 0.5,
        containerHeight: 0.5,
        style: {
          aspectRatio: '1 / 1',
          width: '100%',
        },
      },
      {
        id: 'slot-10-2',
        containerWidth: 0.5,
        containerHeight: 0.5,
        style: {
          aspectRatio: '1 / 1',
          width: '100%',
        },
      },
      {
        id: 'slot-10-3',
        containerWidth: 0.5,
        containerHeight: 0.5,
        style: {
          aspectRatio: '1 / 1',
          width: '100%',
        },
      },
      {
        id: 'slot-10-4',
        containerWidth: 0.5,
        containerHeight: 0.5,
        style: {
          aspectRatio: '1 / 1',
          width: '100%',
        },
      },
    ],
    layoutContainerConfigs: {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        width: '100%',
        maxHeight: '100%',
        height: 'auto',
        aspectRatio: '1 / 1',
      },
    },
  }
  const template11: TPrintLayout = {
    id: 'template-11',
    name: 'Default Template 11',
    layoutType: '6-square',
    printedImageElements: [],
    slotConfigs: [
      {
        id: 'slot-11-1',
        containerWidth: 0.333,
        containerHeight: 0.5,
        style: {
          aspectRatio: '1 / 1',
          height: '100%',
        },
      },
      {
        id: 'slot-11-2',
        containerWidth: 0.333,
        containerHeight: 0.5,
        style: {
          aspectRatio: '1 / 1',
          height: '100%',
        },
      },
      {
        id: 'slot-11-3',
        containerWidth: 0.333,
        containerHeight: 0.5,
        style: {
          aspectRatio: '1 / 1',
          height: '100%',
        },
      },
      {
        id: 'slot-11-4',
        containerWidth: 0.333,
        containerHeight: 0.5,
        style: {
          aspectRatio: '1 / 1',
          height: '100%',
        },
      },
      {
        id: 'slot-11-5',
        containerWidth: 0.333,
        containerHeight: 0.5,
        style: {
          aspectRatio: '1 / 1',
          height: '100%',
        },
      },
      {
        id: 'slot-11-6',
        containerWidth: 0.333,
        containerHeight: 0.5,
        style: {
          aspectRatio: '1 / 1',
          height: '100%',
        },
      },
    ],
    layoutContainerConfigs: {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', // 3 cột thay vì 2
        gridTemplateRows: 'repeat(3, 1fr)', // 2 hàng thay vì 3
        placeItems: 'center', // Căn giữa các items
        width: 'max-content',
        maxWidth: 'max-content',
        height: '100%',
        maxHeight: '100%',
      },
    },
  }
  const template12: TPrintLayout = {
    id: 'template-12',
    name: 'Default Template 12',
    layoutType: 'frame-layout',
    printedImageElements: [],
    slotConfigs: [
      {
        id: 'slot-1',
        containerWidth: 1,
        containerHeight: 1,
        style: {
          gridColumn: 'span 1',
        },
      },
    ],
    layoutContainerConfigs: {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(1, 1fr)',
        gridTemplateRows: 'repeat(1, 1fr)',
        height: 'fit-content',
        maxHeight: 'fit-content',
        width: '100%',
        aspectRatio: '1 / 1',
      },
    },
  }

  if (layoutType) {
    switch (layoutType) {
      case 'full':
        return [template1]
      case '2-horizontal-square':
        return [template2]
      case '2-vertical-square':
        return [template3]
      case '4-square':
        return [template10]
      case '6-square':
        return [template11]
      default:
        return [template1]
    }
  }

  return [template12, template1, template2, template3, template10, template11]
}

export const getSlotConfigs = (layoutType: TLayoutType): TLayoutSlotConfig[] => {
  switch (layoutType) {
    case 'full':
      return hardCodedLayoutData('full')[0].slotConfigs
    case '2-horizontal-square':
      return hardCodedLayoutData('2-horizontal-square')[0].slotConfigs
    case '2-vertical-square':
      return hardCodedLayoutData('2-vertical-square')[0].slotConfigs
    case '4-square':
      return hardCodedLayoutData('4-square')[0].slotConfigs
    case '6-square':
      return hardCodedLayoutData('6-square')[0].slotConfigs
    default:
      return hardCodedLayoutData('full')[0].slotConfigs
  }
}
