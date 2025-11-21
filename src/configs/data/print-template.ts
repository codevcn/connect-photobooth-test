import { TPrintTemplate, TTemplateType } from '@/utils/types/global'

export function hardCodedPrintTemplates(): TPrintTemplate[]
export function hardCodedPrintTemplates(templateKey: TTemplateType): TPrintTemplate
export function hardCodedPrintTemplates(
  templateKey?: TTemplateType
): TPrintTemplate | TPrintTemplate[] {
  const template1Square: TPrintTemplate = {
    id: 'template-3',
    type: '1-square',
    frames: [
      {
        id: 'frame-3',
        index: 1,
        framePerfectRectType: 'square',
        height: 0,
        width: 0,
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 3',
  }

  const template2Horizon: TPrintTemplate = {
    id: 'template-4',
    type: '2-horizon',
    frames: [
      {
        id: 'frame-4',
        index: 1,
        framePerfectRectType: 'horizontal',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-5',
        index: 2,
        framePerfectRectType: 'horizontal',
        height: 0,
        width: 0,
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 4',
  }

  const template2Vertical: TPrintTemplate = {
    id: 'template-5',
    type: '2-vertical',
    frames: [
      {
        id: 'frame-6',
        index: 1,
        framePerfectRectType: 'vertical',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-7',
        index: 2,
        framePerfectRectType: 'vertical',
        height: 0,
        width: 0,
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 5',
  }

  const template3Left: TPrintTemplate = {
    id: 'template-6',
    type: '3-left',
    frames: [
      {
        id: 'frame-8',
        index: 1,
        framePerfectRectType: 'square',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-9',
        index: 2,
        framePerfectRectType: 'vertical',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-10',
        index: 3,
        framePerfectRectType: 'square',
        height: 0,
        width: 0,
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 6',
  }

  const template3Right: TPrintTemplate = {
    id: 'template-7',
    type: '3-right',
    frames: [
      {
        id: 'frame-11',
        index: 1,
        framePerfectRectType: 'vertical',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-12',
        index: 2,
        framePerfectRectType: 'square',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-13',
        index: 3,
        framePerfectRectType: 'square',
        height: 0,
        width: 0,
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 7',
  }

  const template3Top: TPrintTemplate = {
    id: 'template-8',
    type: '3-top',
    frames: [
      {
        id: 'frame-14',
        index: 1,
        framePerfectRectType: 'square',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-15',
        index: 2,
        framePerfectRectType: 'square',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-16',
        index: 3,
        framePerfectRectType: 'horizontal',
        height: 0,
        width: 0,
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 8',
  }

  const template3Bottom: TPrintTemplate = {
    id: 'template-9',
    type: '3-bottom',
    frames: [
      {
        id: 'frame-17',
        index: 1,
        framePerfectRectType: 'horizontal',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-18',
        index: 2,
        framePerfectRectType: 'square',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-19',
        index: 3,
        framePerfectRectType: 'square',
        height: 0,
        width: 0,
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 9',
  }

  const template4Square: TPrintTemplate = {
    id: 'template-10',
    type: '4-square',
    frames: [
      {
        id: 'frame-20',
        index: 1,
        framePerfectRectType: 'square',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-21',
        index: 2,
        framePerfectRectType: 'square',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-22',
        index: 3,
        framePerfectRectType: 'square',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-23',
        index: 4,
        framePerfectRectType: 'square',
        height: 0,
        width: 0,
      },
    ],
    framesCount: 4,
    name: 'Mẫu in 10',
  }

  const template4Horizon: TPrintTemplate = {
    id: 'template-11',
    type: '4-horizon',
    frames: [
      {
        id: 'frame-24',
        index: 1,
        framePerfectRectType: 'horizontal',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-25',
        index: 2,
        framePerfectRectType: 'horizontal',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-26',
        index: 3,
        framePerfectRectType: 'horizontal',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-27',
        index: 4,
        framePerfectRectType: 'horizontal',
        height: 0,
        width: 0,
      },
    ],
    framesCount: 4,
    name: 'Mẫu in 11',
  }

  const template4Vertical: TPrintTemplate = {
    id: 'template-11',
    type: '4-vertical',
    frames: [
      {
        id: 'frame-24',
        index: 1,
        framePerfectRectType: 'vertical',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-25',
        index: 2,
        framePerfectRectType: 'vertical',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-26',
        index: 3,
        framePerfectRectType: 'vertical',
        height: 0,
        width: 0,
      },
      {
        id: 'frame-27',
        index: 4,
        framePerfectRectType: 'vertical',
        height: 0,
        width: 0,
      },
    ],
    framesCount: 4,
    name: 'Mẫu in 11',
  }

  // Nếu không truyền templateKey, trả về toàn bộ mảng
  if (!templateKey) {
    return [
      template1Square,
      template2Horizon,
      template2Vertical,
      template3Left,
      template3Right,
      template3Top,
      template3Bottom,
      template4Square,
      template4Horizon,
      template4Vertical,
    ]
  }

  // Sử dụng switch case để trả về template cụ thể
  switch (templateKey) {
    case '1-square':
      return template1Square
    case '2-horizon':
      return template2Horizon
    case '2-vertical':
      return template2Vertical
    case '3-left':
      return template3Left
    case '3-right':
      return template3Right
    case '3-top':
      return template3Top
    case '3-bottom':
      return template3Bottom
    case '4-square':
      return template4Square
    case '4-horizon':
      return template4Horizon
    case '4-vertical':
      return template4Vertical
    default:
      throw new Error(`Template key "${templateKey}" không tồn tại`)
  }
}
