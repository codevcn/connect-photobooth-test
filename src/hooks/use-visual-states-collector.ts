import { useCallback } from 'react'
import { TElementsVisualState } from '@/utils/types/global'
import { useLayoutStore } from '@/stores/ui/print-layout.store'

type TUseVisualStatesCollectorReturn = {
  collectMockupVisualStates: (mockupContainerRef?: HTMLElement) => TElementsVisualState
}

/**
 * Hook để thu thập visual state của tất cả elements trong edit area
 * Sử dụng data attributes để lấy state trực tiếp từ DOM
 */
export const useVisualStatesCollector = (): TUseVisualStatesCollectorReturn => {
  const collectMockupVisualStates = useCallback(
    (mockupContainerRef?: HTMLElement): TElementsVisualState => {
      const elementsVisualState: TElementsVisualState = {
        texts: [],
        stickers: [],
        printedImages: [],
        storedTemplates: [],
        storedLayouts: [],
        layoutMode: useLayoutStore.getState().layoutMode,
      }

      const pickedLayout = useLayoutStore.getState().pickedLayout
      console.log('>>> [reto] picked Layout:', pickedLayout)
      if (pickedLayout) {
        elementsVisualState.storedLayouts = [pickedLayout]
      }

      for (const element of document.body.querySelectorAll<HTMLElement>(
        '.NAME-print-area-container .NAME-element-type-printed-image'
      )) {
        const visualState = element.getAttribute('data-visual-state')
        if (!visualState) continue
        const visualStateObj = JSON.parse(visualState)
        elementsVisualState.printedImages?.push({
          ...visualStateObj,
          height: element.offsetHeight,
          width: element.offsetWidth,
        })
      }

      for (const element of document.body.querySelectorAll<HTMLElement>(
        '.NAME-print-area-container .NAME-element-type-sticker'
      )) {
        const visualState = element.getAttribute('data-visual-state')
        if (!visualState) continue
        const visualStateObj = JSON.parse(visualState)
        elementsVisualState.stickers?.push({
          ...visualStateObj,
          height: element.offsetHeight,
          width: element.offsetWidth,
        })
      }

      for (const element of document.body.querySelectorAll<HTMLElement>(
        '.NAME-print-area-container .NAME-element-type-text'
      )) {
        const visualState = element.getAttribute('data-visual-state')
        if (!visualState) continue
        elementsVisualState.texts?.push(JSON.parse(visualState))
      }

      // const pickedTemplate = useTemplateStore.getState().pickedTemplate
      // if (pickedTemplate) {
      //   elementsVisualState.storedTemplates?.push({
      //     ...pickedTemplate,
      //     frames: pickedTemplate.frames.map((frame) => {
      //       const placedImageId = frame.placedImage?.id
      //       if (!placedImageId) return frame
      //       const placedImage = document.body.querySelector<HTMLElement>(
      //         `.NAME-print-area-container .NAME-frame-placed-image[data-placed-image-id="${placedImageId}"]`
      //       )
      //       if (!placedImage) return frame
      //       const imgVisualState = placedImage.getAttribute('data-visual-state')
      //       if (imgVisualState && frame.placedImage) {
      //         return {
      //           ...frame,
      //           placedImage: {
      //             ...frame.placedImage,
      //             initialVisualState: JSON.parse(imgVisualState).initialVisualState,
      //           },
      //         }
      //       }
      //       return frame
      //     }),
      //   })
      // }

      // Clean up empty arrays
      if (elementsVisualState.texts?.length === 0) delete elementsVisualState.texts
      if (elementsVisualState.stickers?.length === 0) delete elementsVisualState.stickers
      if (elementsVisualState.printedImages?.length === 0) delete elementsVisualState.printedImages
      if (elementsVisualState.storedLayouts?.length === 0) delete elementsVisualState.storedLayouts
      if (elementsVisualState.storedTemplates?.length === 0)
        delete elementsVisualState.storedTemplates

      // tạo base64 cho dữ liệu
      // for (const sticker of elementsVisualState.stickers || []) {
      //   base64WorkerHelper.createBase64FromURL({ url: sticker.path })
      // }
      // for (const printedImage of elementsVisualState.printedImages || []) {
      //   base64WorkerHelper.createBase64FromURL({ url: printedImage.path })
      // }

      console.log('>>> [reto] element visual state oiiiiiiiiiiiii:', elementsVisualState)
      return elementsVisualState
    },
    []
  )

  return {
    collectMockupVisualStates,
  }
}
