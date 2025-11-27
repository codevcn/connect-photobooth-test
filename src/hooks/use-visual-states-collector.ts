import { useCallback } from 'react'
import { TElementsVisualState, TStoredTemplate } from '@/utils/types/global'
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
        storedTemplates: [],
      }

      for (const element of document.body.querySelectorAll<HTMLElement>(
        '.NAME-element-type-sticker'
      )) {
        const visualState = element.getAttribute('data-visual-state')
        if (!visualState) continue
        const visualStateObj = JSON.parse(visualState)
        elementsVisualState.stickers?.push({
          ...visualStateObj,
          height: element.offsetHeight / visualStateObj.scale,
          width: element.offsetWidth / visualStateObj.scale,
        })
      }

      for (const element of document.body.querySelectorAll<HTMLElement>(
        '.NAME-element-type-text'
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
        console.log(
          '>>> ele:',
          document.body.querySelector<HTMLElement>('.NAME-frames-displayer-print-area')
        )
        if (dataset) {
          console.log('>>> da lay dc dataset:', { dataset })
          elementsVisualState.storedTemplates?.push({
            ...pickedTemplate,
            offsetY: JSON.parse(dataset).offsetY,
          })
        }
      }

      // Clean up empty arrays
      if (elementsVisualState.texts?.length === 0) delete elementsVisualState.texts
      if (elementsVisualState.stickers?.length === 0) delete elementsVisualState.stickers
      if (elementsVisualState.storedTemplates?.length === 0)
        delete elementsVisualState.storedTemplates

      console.log('>>> [now] element visual state oiiiiiiiiiiiii:', elementsVisualState)
      return elementsVisualState
    },
    []
  )

  return {
    collectMockupVisualStates,
  }
}
