import { TKeyboardSuggestion } from '@/utils/types/global'
import { create } from 'zustand'

type TSuggestionLoadingStatus = 'idle' | 'loading' | 'fetched'

type TKeyboardStore = {
  visible: boolean
  suggestions: TKeyboardSuggestion[]
  suggestionsLoadingStatus: TSuggestionLoadingStatus

  // Actions
  setSuggestionsLoading: (status: TSuggestionLoadingStatus) => void
  setSuggestions: (suggestions: TKeyboardSuggestion[]) => void
  clearSuggestions: () => void
  setIsVisible: (visible: boolean) => void
  hideKeyboard: () => void
  resetData: () => void
}

export const useKeyboardStore = create<TKeyboardStore>((set, get) => ({
  visible: false,
  suggestions: [],
  suggestionsLoadingStatus: 'idle',

  setSuggestionsLoading: (status: TSuggestionLoadingStatus) => {
    set(() => ({
      suggestionsLoadingStatus: status,
    }))
  },
  clearSuggestions: () => {
    set(() => ({
      suggestions: [],
    }))
  },
  setSuggestions: (suggestions: TKeyboardSuggestion[]) => {
    set(() => ({
      suggestions,
    }))
  },
  resetData: () => {
    set({ visible: false })
  },
  setIsVisible: (visible: boolean) => {
    set(() => ({ visible }))
    if (!visible) {
      get().clearSuggestions()
    }
  },
  hideKeyboard: () => {
    get().setIsVisible(false)
  },
}))
