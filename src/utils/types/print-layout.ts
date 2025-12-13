import { TPrintedImageVisualState } from './global'

export type TLayoutType =
  | 'full'
  | 'half-width'
  | 'half-height'
  | '2-horizontal-square'
  | '2-vertical-square'
  | '3-left'
  | '3-right'
  | '3-top'
  | '3-bottom'
  | '4-horizon'
  | '4-vertical'
  | '4-square'
  | '6-square'

export type TLayoutPlacedImage = {
  id: string
  url: string
  initialWidth: number
  initialHeight: number
}

export type TLayoutSlotConfig = {
  id: string
  containerWidth: number // Tỷ lệ width của slot so với print area (0-1)
  containerHeight: number // Tỷ lệ height của slot so với print area (0-1)
  style: React.CSSProperties
  placedImage?: TLayoutPlacedImage
}

export type TPrintLayout = {
  id: string
  name: string
  layoutType: TLayoutType
  printedImageElements: TPrintedImageVisualState[]
  slotConfigs: TLayoutSlotConfig[]
  layoutContainerConfigs: {
    style: React.CSSProperties
  }
  mountType?: 'suggested' | 'picked'
}
