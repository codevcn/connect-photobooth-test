import { TSizeInfo, TTemplateFrame, TTemplateType } from '@/utils/types/global'

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
  frameIndex: number,
  defaultStyle: React.CSSProperties = {}
): React.CSSProperties => {
  if (templateType === '2-horizon') {
    if (frameIndex === 1) {
      return {
        objectPosition: 'bottom',
      }
    } else {
      return {
        objectPosition: 'top',
      }
    }
  } else if (templateType === '2-vertical') {
    if (frameIndex === 1) {
      return { objectPosition: 'right' }
    } else {
      return { objectPosition: 'left' }
    }
  } else if (templateType === '3-left') {
    if (frameIndex === 1) {
      return { objectPosition: 'right bottom' }
    } else if (frameIndex === 2) {
      return { objectPosition: 'left center' }
    } else {
      return { objectPosition: 'right top' }
    }
  } else if (templateType === '3-right') {
    if (frameIndex === 1) {
      return { objectPosition: 'right center' }
    } else if (frameIndex === 2) {
      return { objectPosition: 'left bottom' }
    } else {
      return { objectPosition: 'left top' }
    }
  } else if (templateType === '3-top') {
    if (frameIndex === 1) {
      return { objectPosition: 'right bottom' }
    } else if (frameIndex === 2) {
      return { objectPosition: 'left bottom' }
    } else {
      return { objectPosition: 'top center' }
    }
  } else if (templateType === '3-bottom') {
    if (frameIndex === 1) {
      return { objectPosition: 'bottom center' }
    } else if (frameIndex === 2) {
      return { objectPosition: 'right top' }
    } else {
      return { objectPosition: 'left top' }
    }
  } else if (templateType === '4-horizon') {
    return { objectPosition: 'center' }
  } else if (templateType === '4-vertical') {
    return { objectPosition: 'center' }
  } else if (templateType === '4-square') {
    if (frameIndex === 1) {
      return { objectPosition: 'right bottom' }
    } else if (frameIndex === 2) {
      return { objectPosition: 'left bottom' }
    } else if (frameIndex === 3) {
      return { objectPosition: 'right top' }
    } else {
      return { objectPosition: 'left top' }
    }
  }
  return defaultStyle
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
