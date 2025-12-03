import { useCallback } from 'react'
import { TElementsVisualState } from '@/utils/types/global'
import { useTemplateStore } from '@/stores/ui/template.store'

type TUseVisualStatesCollectorReturn = {
  collectMockupVisualStates: (mockupmockupContainerRef?: HTMLElement) => TElementsVisualState
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

      const pickedTemplate = useTemplateStore.getState().pickedTemplate
      if (pickedTemplate) {
        const dataset = document.body
          .querySelector<HTMLElement>('.NAME-frames-displayer-print-area')
          ?.getAttribute('data-visual-state')
        if (dataset) {
          elementsVisualState.storedTemplates?.push({
            ...pickedTemplate,
            initialVisualState: JSON.parse(dataset).initialVisualState,
          })
        }
      }

      // Clean up empty arrays
      if (elementsVisualState.texts?.length === 0) delete elementsVisualState.texts
      if (elementsVisualState.stickers?.length === 0) delete elementsVisualState.stickers
      if (elementsVisualState.storedTemplates?.length === 0)
        delete elementsVisualState.storedTemplates

      console.log('>>> [coll] element visual state oiiiiiiiiiiiii:', elementsVisualState)
      return elementsVisualState
    },
    []
  )

  return {
    collectMockupVisualStates,
  }
}
