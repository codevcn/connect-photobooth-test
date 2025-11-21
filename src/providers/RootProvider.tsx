import { GlobalContext, LoadedTextFontContext } from '@/contexts/global-context'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { generateUniqueId } from '@/utils/helpers'
import { TElementType, TPreSentMockupImageLink } from '@/utils/types/global'
import { useEffect, useState } from 'react'

type TGlobalState = {
  pickedElementRoot: HTMLElement | null
  elementType: TElementType | null
  sessionId: string | null
  preSentMockupImageLinks: TPreSentMockupImageLink[]
}

export const AppRootProvider = ({ children }: { children: React.ReactNode }) => {
  const [globalState, setGlobalState] = useState<TGlobalState>({
    pickedElementRoot: null,
    elementType: null,
    sessionId: generateUniqueId(),
    preSentMockupImageLinks: [],
  })
  const [availableFonts, setAvailableFonts] = useState<string[]>([])

  const addPreSentMockupImageLink = (imageUrl: string, mockupId: string) => {
    setGlobalState((pre) => ({
      ...pre,
      preSentMockupImageLinks: [...pre.preSentMockupImageLinks, { mockupId, imageUrl }],
    }))
  }

  const listenPickElement = (element: HTMLElement | null, elementType: TElementType | null) => {
    setGlobalState((pre) => ({ ...pre, pickedElementRoot: element, elementType }))
  }

  useEffect(() => {
    eventEmitter.on(EInternalEvents.PICK_ELEMENT, listenPickElement)
    return () => {
      eventEmitter.off(EInternalEvents.PICK_ELEMENT, listenPickElement)
    }
  }, [])

  return (
    <GlobalContext.Provider value={{ ...globalState, addPreSentMockupImageLink }}>
      <LoadedTextFontContext.Provider value={{ availableFonts, setAvailableFonts }}>
        {children}
      </LoadedTextFontContext.Provider>
    </GlobalContext.Provider>
  )
}
