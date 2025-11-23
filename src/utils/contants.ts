type TInitialContentsType =
  | 'ELEMENT_ZINDEX_STEP'
  | 'ELEMENT_ZINDEX'
  | 'ELEMENT_WIDTH'
  | 'ELEMENT_HEIGHT'
  | 'ELEMENT_X'
  | 'ELEMENT_Y'
  | 'ELEMENT_ROTATION'
  | 'ELEMENT_ZOOM'
  | 'ELEMENT_TEXT_FONT_SIZE'
  | 'ELEMENT_TEXT_COLOR'
  | 'ELEMENT_ROUND_ZOOMING_FIXED'
  | 'ELEMENT_TEXT_FONT_WEIGHT'
  | 'ELEMENT_TEXT_FONT_FAMILY'
  | 'PAYMENT_ZALO_COLOR'
  | 'PAYMENT_MOMO_COLOR'
  | 'PAYMENT_COD_COLOR'
  | 'PLACED_IMG_FRAME_INDEX'
  | 'PLACED_IMG_OBJECT_FIT'
  | 'PLACED_IMG_ZOOM'
  | 'PLACED_IMG_SQUARE_ROTATION'
  | 'MAX_DIFF_RATIO_VALUE'
  | 'PLACED_IMG_DIRECTION'

export const getInitialContants = <R>(type: TInitialContentsType): R => {
  switch (type) {
    case 'ELEMENT_ZINDEX_STEP':
      return 10 as R
    case 'ELEMENT_ZINDEX':
      return 11 as R
    case 'ELEMENT_WIDTH':
      return 200 as R
    case 'ELEMENT_HEIGHT':
      return 200 as R
    case 'ELEMENT_X':
      return 0 as R
    case 'ELEMENT_Y':
      return 0 as R
    case 'ELEMENT_ROTATION':
      return 0 as R
    case 'ELEMENT_ZOOM':
      return 1 as R
    case 'ELEMENT_TEXT_FONT_SIZE':
      return 24 as R
    case 'ELEMENT_TEXT_COLOR':
      return '#000000' as R
    case 'ELEMENT_ROUND_ZOOMING_FIXED':
      return 12 as R
    case 'ELEMENT_TEXT_FONT_WEIGHT':
      return 400 as R
    case 'ELEMENT_TEXT_FONT_FAMILY':
      return 'Arial' as R
    case 'PAYMENT_ZALO_COLOR':
      return '#0144DB' as R
    case 'PAYMENT_MOMO_COLOR':
      return '#A50064' as R
    case 'PAYMENT_COD_COLOR':
      return '#008000' as R
    case 'PLACED_IMG_FRAME_INDEX':
      return 1 as R
    case 'PLACED_IMG_OBJECT_FIT':
      return 'contain' as R
    case 'PLACED_IMG_ZOOM':
      return 1 as R
    case 'PLACED_IMG_SQUARE_ROTATION':
      return 0 as R
    case 'MAX_DIFF_RATIO_VALUE':
      return 0.1 as R
    case 'PLACED_IMG_DIRECTION':
      return 'center' as R
    default:
      return null as R
  }
}

type TCommonContentsType =
  | 'MAX_HEIGHT_CROP_DISPLAY'
  | 'MAX_CROP_PREVIEWS_COUNT'
  | 'MIN_CROP_SIZE_WIDTH'
  | 'MIN_CROP_SIZE_HEIGHT'
  | 'FIXED_COUNTDOWN_PAYMENT_SECONDS'

export const getCommonContants = <R>(type: TCommonContentsType): R => {
  switch (type) {
    case 'MAX_HEIGHT_CROP_DISPLAY':
      return 250 as R
    case 'MAX_CROP_PREVIEWS_COUNT':
      return 4 as R
    case 'MIN_CROP_SIZE_WIDTH':
      return 50 as R
    case 'MIN_CROP_SIZE_HEIGHT':
      return 50 as R
    case 'FIXED_COUNTDOWN_PAYMENT_SECONDS':
      return 900 as R // 15 minutes
    default:
      return null as R
  }
}
