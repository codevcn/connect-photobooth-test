import { TPlacedImage, TSizeInfo, TTemplateFrame, TTemplateType } from '@/utils/types/global'

/**
 * Chuyển đổi template type sang grid CSS styles
 * @param templateType - Loại template
 * @returns Object chứa các CSS properties cho grid layout
 */
export const styleToFramesDisplayerByTemplateType = (
  templateType: TTemplateType
): React.CSSProperties => {
  switch (templateType) {
    // 1 frame templates
    case '1-square':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        height: '100%',
        width: '100%',
      }

    // 2 frames templates
    case '2-horizon':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'repeat(2, 1fr)',
        height: '100%',
        width: '100%',
      }
    case '2-vertical':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: '1fr',
        width: '100%',
        height: '100%',
      }

    // 3 frames templates
    case '3-left':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        height: '100%',
        width: '100%',
      }
    case '3-right':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        height: '100%',
        width: '100%',
      }
    case '3-top':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        height: '100%',
        width: '100%',
      }
    case '3-bottom':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        height: '100%',
        width: '100%',
      }

    // 4 frames templates
    case '4-square':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        height: '100%',
        width: '100%',
      }
    case '4-horizon':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'repeat(4, 1fr)',
        height: '100%',
        width: '100%',
      }
    case '4-vertical':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: '1fr',
        height: '100%',
        width: '100%',
      }

    default:
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        height: '100%',
        width: '100%',
      }
  }
}

export const styleFrameByTemplateType = (
  templateType: TTemplateType,
  frameIndex: number
): React.CSSProperties => {
  switch (templateType) {
    case '3-left':
      if (frameIndex === 2) return { gridRow: 'span 2 / span 2' }
      return {}
    case '3-top':
      if (frameIndex === 3) return { gridColumn: 'span 2 / span 2' }
      return {}
    case '3-right':
      if (frameIndex === 1) return { gridRow: 'span 2 / span 2' }
      return {}
    case '3-bottom':
      if (frameIndex === 1) return { gridColumn: 'span 2 / span 2' }
      return {}
    default:
      return {}
  }
}

export const stylePlacedImageByTemplateType = (
  templateType: TTemplateType,
  placedImage: TPlacedImage,
  frame: TTemplateFrame,
  defaultStyle: React.CSSProperties = {},
  isLog?: boolean
): React.CSSProperties => {
  const { width, height, index: frameIndex } = frame
  const styleForSizeAdjustment: React.CSSProperties = {}
  if (
    decideFitBy(placedImage.prrintedImageWidth, placedImage.printedImageHeight, width, height) ===
    'width'
  ) {
    styleForSizeAdjustment.width = '100%'
    styleForSizeAdjustment.height = 'auto'
  } else {
    styleForSizeAdjustment.height = '100%'
    styleForSizeAdjustment.width = 'auto'
  }
  if (templateType === '2-horizon') {
    if (frameIndex === 1) {
      return {
        bottom: '0',
        top: 'auto',
        left: '50%',
        transform: 'translateX(-50%)',
        right: 'auto',
        ...styleForSizeAdjustment,
      }
    } else {
      return {
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        right: 'auto',
        bottom: 'auto',
        ...styleForSizeAdjustment,
      }
    }
  } else if (templateType === '2-vertical') {
    if (frameIndex === 1) {
      return {
        right: '0',
        top: '50%',
        bottom: 'auto',
        left: 'auto',
        transform: 'translateY(-50%)',
        ...styleForSizeAdjustment,
      }
    } else {
      return {
        left: '0',
        top: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translateY(-50%)',
        ...styleForSizeAdjustment,
      }
    }
  } else if (templateType === '3-left') {
    if (frameIndex === 1) {
      return {
        right: '0',
        bottom: '0',
        top: 'auto',
        left: 'auto',
        ...styleForSizeAdjustment,
      }
    } else if (frameIndex === 2) {
      return {
        left: '0',
        top: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translateY(-50%)',
        ...styleForSizeAdjustment,
      }
    } else {
      return { right: '0', top: '0', left: 'auto', bottom: 'auto', ...styleForSizeAdjustment }
    }
  } else if (templateType === '3-right') {
    if (frameIndex === 1) {
      return {
        right: '0',
        top: '50%',
        left: 'auto',
        bottom: 'auto',
        transform: 'translateY(-50%)',
        ...styleForSizeAdjustment,
      }
    } else if (frameIndex === 2) {
      return { left: '0', bottom: '0', top: 'auto', right: 'auto', ...styleForSizeAdjustment }
    } else {
      return { left: '0', top: '0', right: 'auto', bottom: 'auto', ...styleForSizeAdjustment }
    }
  } else if (templateType === '3-top') {
    if (frameIndex === 1) {
      return { right: '0', bottom: '0', top: 'auto', left: 'auto', ...styleForSizeAdjustment }
    } else if (frameIndex === 2) {
      return { left: '0', bottom: '0', top: 'auto', right: 'auto', ...styleForSizeAdjustment }
    } else {
      return {
        top: '0',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translateX(-50%)',
        ...styleForSizeAdjustment,
      }
    }
  } else if (templateType === '3-bottom') {
    if (frameIndex === 1) {
      return {
        bottom: '0',
        left: '50%',
        right: 'auto',
        top: 'auto',
        transform: 'translateX(-50%)',
        ...styleForSizeAdjustment,
      }
    } else if (frameIndex === 2) {
      return { right: '0', top: '0', left: 'auto', bottom: 'auto', ...styleForSizeAdjustment }
    } else {
      return { left: '0', top: '0', right: 'auto', bottom: 'auto', ...styleForSizeAdjustment }
    }
  } else if (templateType === '4-horizon') {
    return {
      top: '50% ',
      left: 'auto',
      right: 'auto',
      bottom: 'auto',
      transform: 'translateY(-50%)',
      ...styleForSizeAdjustment,
    }
  } else if (templateType === '4-vertical') {
    return {
      left: '50% ',
      right: 'auto',
      top: 'auto',
      bottom: 'auto',
      transform: 'translateX(-50%)',
      ...styleForSizeAdjustment,
    }
  } else if (templateType === '4-square') {
    if (frameIndex === 1) {
      return { right: '0', bottom: '0', top: 'auto', left: 'auto', ...styleForSizeAdjustment }
    } else if (frameIndex === 2) {
      return { left: '0', bottom: '0', top: 'auto', right: 'auto', ...styleForSizeAdjustment }
    } else if (frameIndex === 3) {
      return { right: '0', top: '0', left: 'auto', bottom: 'auto', ...styleForSizeAdjustment }
    } else {
      return { left: '0', top: '0', right: 'auto', bottom: 'auto', ...styleForSizeAdjustment }
    }
  }
  return {
    ...defaultStyle,
    ...styleForSizeAdjustment,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }
}

export const assignFrameSizeByTemplateType = (
  printeAreaSize: TSizeInfo,
  templateType: TTemplateType,
  frame: TTemplateFrame
): void => {
  switch (templateType) {
    case '1-square':
      frame.width = printeAreaSize.width
      frame.height = printeAreaSize.height
      break
    case '2-horizon':
      frame.width = printeAreaSize.width
      frame.height = printeAreaSize.height / 2
      break
    case '2-vertical':
      frame.width = printeAreaSize.width / 2
      frame.height = printeAreaSize.height
      break
    case '3-left':
      if (frame.index === 2) {
        frame.width = printeAreaSize.width / 2
        frame.height = printeAreaSize.height
      } else {
        frame.width = printeAreaSize.width / 2
        frame.height = printeAreaSize.height / 2
      }
      break
    case '3-right':
      if (frame.index === 1) {
        frame.width = printeAreaSize.width / 2
        frame.height = printeAreaSize.height
      } else {
        frame.width = printeAreaSize.width / 2
        frame.height = printeAreaSize.height / 2
      }
      break
    case '3-top':
      if (frame.index === 3) {
        frame.width = printeAreaSize.width
        frame.height = printeAreaSize.height / 2
      } else {
        frame.width = printeAreaSize.width / 2
        frame.height = printeAreaSize.height / 2
      }
      break
    case '3-bottom':
      if (frame.index === 1) {
        frame.width = printeAreaSize.width
        frame.height = printeAreaSize.height / 2
      } else {
        frame.width = printeAreaSize.width / 2
        frame.height = printeAreaSize.height / 2
      }
      break
    case '4-square':
      frame.width = printeAreaSize.width / 2
      frame.height = printeAreaSize.height / 2
      break
    case '4-horizon':
      frame.width = printeAreaSize.width
      frame.height = printeAreaSize.height / 4
      break
    case '4-vertical':
      frame.width = printeAreaSize.width / 4
      frame.height = printeAreaSize.height
      break
    default:
      frame.width = printeAreaSize.width
      frame.height = printeAreaSize.height
      break
  }
}

// /**

// * Xác định chiều khớp trước khi scale item tới box
// * @param {number} boxW - width của box
// * @param {number} boxH - height của box
// * @param {number} itemW - width ban đầu của item
// * @param {number} itemH - height ban đầu của item
// * @returns {object} - { shrinkFirst: 'width'|'height', expandFirst: 'width'|'height' }
//   */
export function decideFitBy(
  itemW: number,
  itemH: number,
  boxW: number,
  boxH: number
): 'width' | 'height' {
  const scaleBox = boxW / boxH
  const scaleItem = itemW / itemH
  // scale nhỏ hơn → giới hạn trước → fit by theo chiều đó
  return scaleBox < scaleItem ? 'width' : 'height'
}

// // Ví dụ
// const boxW = 200,
//   boxH = 300
// const itemW = 400,
//   itemH = 500
// console.log(getFirstMatchedDimension(boxW, boxH, itemW, itemH))
// // Output: { shrinkFirst: 'width', expandFirst: 'height' }
