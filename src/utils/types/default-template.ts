export type TLayoutType =
  | 'full'
  | 'half-width'
  | 'half-height'
  | '3-left'
  | '3-right'
  | '3-top'
  | '3-bottom'
  | '4-square'
  | '4-horizon'
  | '4-vertical'

export type TDefaultTemplate = {
  id: string
  name: string
  layoutType: TLayoutType
}
