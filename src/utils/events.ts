import { TElementType, TframePerfectRectType, TSizeInfo } from './types/global'

export enum EInternalEvents {
  CLICK_ON_PAGE = 'CLICK_ON_PAGE',
  SUBMIT_PRINTED_IMAGE_ELE_PROPS = 'SUBMIT_PRINTED_IMAGE_ELE_PROPS',
  SUBMIT_STICKER_ELE_PROPS = 'SUBMIT_STICKER_ELE_PROPS',
  SUBMIT_TEXT_ELE_PROPS = 'SUBMIT_TEXT_ELE_PROPS',
  // SUBMIT_PRODUCT_IMAGE_ELE_PROPS = 'SUBMIT_PRODUCT_IMAGE_ELE_PROPS',
  PICK_ELEMENT = 'PICK_ELEMENT',
  SYNC_ELEMENT_PROPS = 'SYNC_ELEMENT_PROPS',
  OPEN_CROP_ELEMENT_MODAL = 'OPEN_CROP_ELEMENT_MODAL',
  REPLACE_ELEMENT_IMAGE_URL = 'REPLACE_ELEMENT_IMAGE_URL',
  HIDE_SHOW_PRINTED_IMAGES_MODAL = 'HIDE_SHOW_PRINTED_IMAGES_MODAL',
}

interface IInternalEvents {
  [EInternalEvents.CLICK_ON_PAGE]: (target: HTMLElement | null) => void
  [EInternalEvents.SUBMIT_PRINTED_IMAGE_ELE_PROPS]: (
    elementId: string | null,
    scale?: number,
    angle?: number,
    posX?: number,
    posY?: number,
    zindex?: number
  ) => void
  [EInternalEvents.SUBMIT_STICKER_ELE_PROPS]: (
    elementId: string | null,
    scale?: number,
    angle?: number,
    posX?: number,
    posY?: number,
    zindex?: number
  ) => void
  [EInternalEvents.SUBMIT_TEXT_ELE_PROPS]: (
    elementId: string | null,
    fontSize?: number,
    angle?: number,
    posX?: number,
    posY?: number,
    zindex?: number,
    color?: string,
    content?: string,
    fontFamily?: string
  ) => void
  [EInternalEvents.PICK_ELEMENT]: (element: HTMLElement | null, elementType: TElementType) => void
  [EInternalEvents.SYNC_ELEMENT_PROPS]: (elementId: string | null, type: TElementType) => void
  [EInternalEvents.OPEN_CROP_ELEMENT_MODAL]: (elementId: string) => void
  [EInternalEvents.REPLACE_ELEMENT_IMAGE_URL]: (elementId: string, newUrl: string) => void
  [EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL]: (
    show: boolean,
    frameIdToAddPrintedImage: string,
    frameSize: TSizeInfo
  ) => void
}

class EventEmitter<IEvents extends IInternalEvents> {
  private listeners: {
    [K in keyof IEvents]?: IEvents[K][]
  } = {}

  on<K extends keyof IEvents>(name: K, handler: IEvents[K]): void {
    if (this.listeners[name]) {
      this.listeners[name].push(handler)
    } else {
      this.listeners[name] = [handler]
    }
  }

  off<K extends keyof IEvents>(name: K, handler?: IEvents[K]): void {
    if (handler) {
      this.listeners[name] = (this.listeners[name] ?? []).filter((h) => h !== handler)
    } else {
      delete this.listeners[name]
    }
  }

  emit<K extends keyof IEvents>(
    name: K,
    ...args: IEvents[K] extends (...args: infer P) => any ? P : never
  ): void {
    for (const handler of this.listeners[name] ?? []) {
      queueMicrotask(() => {
        ;(handler as any)(...args)
      })
    }
  }
}

export const eventEmitter = new EventEmitter<IInternalEvents>()
