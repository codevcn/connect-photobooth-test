import { TElementType, TSizeInfo } from './types/global'

export enum EInternalEvents {
  CLICK_ON_PAGE = 'CLICK_ON_PAGE',
  SUBMIT_PRINTED_IMAGE_ELE_PROPS = 'SUBMIT_PRINTED_IMAGE_ELE_PROPS',
  SUBMIT_STICKER_ELE_PROPS = 'SUBMIT_STICKER_ELE_PROPS',
  SUBMIT_TEXT_ELE_PROPS = 'SUBMIT_TEXT_ELE_PROPS',
  // SUBMIT_PRODUCT_IMAGE_ELE_PROPS = 'SUBMIT_PRODUCT_IMAGE_ELE_PROPS',
  PICK_ELEMENT = 'PICK_ELEMENT',
  SYNC_ELEMENT_PROPS = 'SYNC_ELEMENT_PROPS',
  REPLACE_ELEMENT_IMAGE_URL = 'REPLACE_ELEMENT_IMAGE_URL',
  HIDE_SHOW_PRINTED_IMAGES_MODAL = 'HIDE_SHOW_PRINTED_IMAGES_MODAL',
  CROP_PRINTED_IMAGE_ON_FRAME = 'CROP_PRINTED_IMAGE_ON_FRAME',
  ADD_TO_CART = 'ADD_TO_CART',
  BEFORE_PRINT_AREA_CHANGE = 'BEFORE_PRINT_AREA_CHANGE',
  EDITED_PRINT_AREA_CHANGED = 'EDITED_PRINT_AREA_CHANGED',
  ADD_TEXT_ON_DONE_KEYBOARD = 'ADD_TEXT_ON_DONE_KEYBOARD',
}

interface IInternalEvents {
  [EInternalEvents.ADD_TEXT_ON_DONE_KEYBOARD]: (textContent: string) => void
  [EInternalEvents.CROP_PRINTED_IMAGE_ON_FRAME]: (frameId: string, croppedImageUrl: string) => void
  [EInternalEvents.CLICK_ON_PAGE]: (target: HTMLElement | null) => void
  [EInternalEvents.SUBMIT_PRINTED_IMAGE_ELE_PROPS]: (
    elementId: string,
    scale?: number,
    angle?: number,
    posX?: number,
    posY?: number,
    zindex?: number
  ) => void
  [EInternalEvents.SUBMIT_STICKER_ELE_PROPS]: (
    elementId: string,
    scale?: number,
    angle?: number,
    posX?: number,
    posY?: number,
    zindex?: number
  ) => void
  [EInternalEvents.SUBMIT_TEXT_ELE_PROPS]: (
    elementId: string,
    angle?: number,
    posX?: number,
    posY?: number,
    zindex?: number,
    color?: string,
    content?: string,
    fontFamily?: string
  ) => void
  [EInternalEvents.PICK_ELEMENT]: (
    elementId: string,
    element: HTMLElement,
    elementType: TElementType
  ) => void
  [EInternalEvents.SYNC_ELEMENT_PROPS]: (elementId: string, type: TElementType) => void
  [EInternalEvents.REPLACE_ELEMENT_IMAGE_URL]: (elementId: string, newUrl: string) => void
  [EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL]: (
    show: boolean,
    slotId: string,
    layoutId: string
  ) => void
  [EInternalEvents.ADD_TO_CART]: () => void
  [EInternalEvents.BEFORE_PRINT_AREA_CHANGE]: () => void
  [EInternalEvents.EDITED_PRINT_AREA_CHANGED]: () => void
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
