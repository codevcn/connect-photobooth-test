import { useEffect, useRef, useState } from 'react'
import Keyboard from 'react-simple-keyboard'
import 'simple-keyboard/build/css/index.css'
import { useVietnameseKeyboard } from '@/hooks/use-vietnamese-keyboard'
import '@/styles/virtual-keyboard.css'
import { AutoSizeTextField } from '../AutoSizeTextField'
import { CustomScrollbar } from '../CustomScrollbar'
import { useKeyboardStore } from '@/stores/keyboard/keyboard.store'
import { TKeyboardSuggestion } from '@/utils/types/global'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { TAutoSizeTextFieldController } from '@/utils/types/component'

type TKeyboardSuggestionsProps = {
  currentInputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
  onPickSuggestion?: (suggestion: TKeyboardSuggestion, type: string) => void
}

const TypingSuggestions = ({ currentInputRef, onPickSuggestion }: TKeyboardSuggestionsProps) => {
  const suggestions = useKeyboardStore((s) => s.suggestions)
  const loadingStatus = useKeyboardStore((s) => s.suggestionsLoadingStatus)

  const pickSuggestion = (suggestion: TKeyboardSuggestion) => {
    let type = 'province'
    if (currentInputRef.current) {
      if (currentInputRef.current.classList.contains('NAME-district')) {
        type = 'district'
      } else if (currentInputRef.current.classList.contains('NAME-ward')) {
        type = 'ward'
      }
    }
    eventEmitter.emit(EInternalEvents.KEYBOARD_SUGGESTION_PICKED, suggestion, type)
    onPickSuggestion?.(suggestion, type)
  }

  return loadingStatus === 'fetched' ? (
    suggestions && suggestions.length > 0 && (
      <CustomScrollbar
        showScrollbar={false}
        classNames={{
          container: 'mx-3',
          content: 'flex flex-nowrap gap-4 w-full py-2 max-h-28 bg-white border-b border-gray-200',
        }}
      >
        {suggestions.map((suggestion) => (
          <button
            onClick={() => pickSuggestion(suggestion)}
            key={suggestion.id}
            className="flex items-center gap-2 px-2 py-1 bg-gray-100 mobile-touch rounded hover:bg-gray-300 w-max whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-map-pin-icon lucide-map-pin w-6 h-6 5xl:w-8 5xl:h-8 text-main-cl"
            >
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{suggestion.text}</span>
          </button>
        ))}
      </CustomScrollbar>
    )
  ) : loadingStatus === 'loading' ? (
    <div className="flex justify-center w-full py-2 px-4 border-b border-gray-200 bg-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-loader-icon lucide-loader animate-spin"
      >
        <path d="M12 2v4" />
        <path d="m16.2 7.8 2.9-2.9" />
        <path d="M18 12h4" />
        <path d="m16.2 16.2 2.9 2.9" />
        <path d="M12 18v4" />
        <path d="m4.9 19.1 2.9-2.9" />
        <path d="M2 12h4" />
        <path d="m4.9 4.9 2.9 2.9" />
      </svg>
    </div>
  ) : null
}

type TLayoutName = 'default' | 'shift' | 'specialCharacters' | 'numberic'

type TVietnameseKeyboardProps = {
  textDisplayerRef: React.RefObject<HTMLTextAreaElement | null>
  currentInputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
} & Partial<{
  onKeyPress: (button: string) => void
  onChange: (inputValue: string) => void
  onClose: () => void
  onSubmit: (value: string) => void
  initialInputValue: string
  placeholder: string
  theme: 'light' | 'dark'
  maxLength: number
  autoFocus: boolean
  keyboardRef: React.RefObject<any>
  keyboardName: string
  isOpen: boolean
}>

export const VietnameseKeyboard = ({
  onKeyPress,
  onChange,
  onClose,
  onSubmit,
  initialInputValue = '',
  placeholder = 'Nhập văn bản...',
  theme = 'light',
  maxLength,
  autoFocus = true,
  keyboardRef: externalKeyboardRef,
  keyboardName = 'NAME-vietnamese-virtual-keyboard',
  textDisplayerRef,
  currentInputRef,
  isOpen = false,
}: TVietnameseKeyboardProps) => {
  const [vietnameseLayout, setVietnameseLayout] = useState({
    default: [
      '1 2 3 4 5 6 7 8 9 0 - = {bksp}',
      'q w e r t y u i o p [ ] \\',
      "a s d f g h j k l ; ' {enter}",
      '{shift} z x c v b n m , . / {shift}',
      '{=/<} {TELEX} {1234} {space} @ gmail .com {done}',
    ],
    shift: [
      '1 2 3 4 5 6 7 8 9 0 _ + {bksp}',
      'Q W E R T Y U I O P { } |',
      'A S D F G H J K L : " {enter}',
      '{shift} Z X C V B N M < > ? {shift}',
      '{=/<} {TELEX} {1234} {space} @ gmail .com {done}',
    ],
    specialCharacters: [
      '1 2 3 4 5 6 7 8 9 0 _ + {bksp}',
      '~ ˋ | • √ π ÷ × ¶ Δ { } |',
      '# $ % & ( ) : " {enter}',
      '* " ! < > ?',
      '{abc} {TELEX} {1234} {space} @ gmail .com {done}',
    ],
    numberic: [', 1 2 3 {bksp}', '( 4 5 6 -', ') 7 8 9 +', '{abc} . 0 {space} {done}'],
  })

  const display: Record<string, string> = {
    ';': '<span class="text-xl font-bold">;</span>',
    '-': '<span class="text-xl scale-x-[3.25] inline-block">-</span>',
    '~': '<span class="text-xl">~</span>',
    '`': '<span class="text-3xl">`</span>',
    '*': '<span class="text-3xl translate-y-1 inline-block">*</span>',
    ':': '<span class="text-xl font-bold">:</span>',
    "'": '<span class="text-xl font-bold">\'</span>',
    ',': '<span class="text-3xl font-bold -translate-y-1 inline-block">,</span>',
    '.': '<span class="text-3xl font-bold translate-y-1 inline-block">.</span>',
    '{1234}': '<span>1234</span>',
    '{=/<}': '<span>=/<</span>',
    '{abc}': '<span>ABC</span>',
    '{TELEX}': `<span>TELEX</span>`,
    '{VNI}': `<span>VNI</span>`,
    '{bksp}': `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        class="lucide lucide-delete-icon lucide-delete"
      >
        <path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
        <path d="m12 9 6 6" />
        <path d="m18 9-6 6" />
      </svg>
    `,
    '{enter}': `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="3"
      >
        <path
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          d="M20 7v1.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C17.72 13 16.88 13 15.2 13H4m0 0 4-4m-4 4 4 4"
        />
      </svg>
    `,
    '{shift}': `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        class="lucide lucide-arrow-big-up-icon lucide-arrow-big-up"
      >
        <path d="M9 13a1 1 0 0 0-1-1H5.061a1 1 0 0 1-.75-1.811l6.836-6.835a1.207 1.207 0 0 1 1.707 0l6.835 6.835a1 1 0 0 1-.75 1.811H16a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
      </svg>
    `,
    '{space}': `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        class="lucide lucide-space-icon lucide-space"
      >
        <path d="M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1" />
      </svg>
    `,
    '{clear}': `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        class="lucide lucide-eraser-icon lucide-eraser"
      >
        <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
        <path d="m5.082 11.09 8.828 8.828" />
      </svg>
    `,
    '{done}': `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        class="lucide lucide-check-icon lucide-check"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    `,
  }

  const buttonTheme = [
    {
      class: 'hg-button-to-numeric-characters',
      buttons: '{1234}',
    },
    {
      class: 'hg-button-to-special-characters',
      buttons: '{=/<}',
    },
    {
      class: 'hg-button-to-normal-letters',
      buttons: '{abc}',
    },
    {
      class: 'hg-button-mode-telex',
      buttons: '{TELEX}',
    },
    {
      class: 'hg-button-mode-vni',
      buttons: '{VNI}',
    },
    {
      class: 'hg-button-clear',
      buttons: '{clear}',
    },
    {
      class: 'hg-button-bksp',
      buttons: '{bksp}',
    },
    {
      class: 'hg-button-enter',
      buttons: '{enter}',
    },
    {
      class: 'hg-button-shift',
      buttons: '{shift}',
    },
    {
      class: 'hg-button-space',
      buttons: '{space}',
    },
    {
      class: 'hg-button-done',
      buttons: '{done}',
    },
  ]

  const [input, setInput] = useState<string>(initialInputValue)
  const [layoutName, setLayoutName] = useState<TLayoutName>('default')
  const internalKeyboardRef = useRef<any>(null)
  const keyboardRef = externalKeyboardRef || internalKeyboardRef
  // Track caret position
  const caretPositionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 })
  // Track enter key press state
  const enterKeyPressedRef = useRef<boolean>(false)
  const doneKeyPressedRef = useRef<boolean>(false)
  const textFieldControllerRef = useRef<TAutoSizeTextFieldController>({ setValue: () => {} })

  const { inputMethod, toggleInputMethod, processVietnameseInput, resetBuffer } =
    useVietnameseKeyboard()

  const submitInputValue = () => {
    onSubmit?.(input)
    onClose?.()
    resetBuffer()
  }

  useEffect(() => {
    setInput(initialInputValue)
    // Reset caret to end when input value changes externally
    caretPositionRef.current = { start: initialInputValue.length, end: initialInputValue.length }
    // Set caret position to end after component mounts or input changes
    setCaretPosition(initialInputValue.length)
  }, [initialInputValue])

  // Helper to get current caret position from textarea
  const getCaretPosition = () => {
    const textarea = textDisplayerRef?.current
    if (textarea) {
      return {
        start: textarea.selectionStart ?? input.length,
        end: textarea.selectionEnd ?? input.length,
      }
    }
    return caretPositionRef.current
  }

  // Helper to set caret position in textarea
  const setCaretPosition = (pos: number) => {
    caretPositionRef.current = { start: pos, end: pos }
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      const textarea = textDisplayerRef?.current
      if (textarea) {
        textarea.setSelectionRange(pos, pos)
        textarea.focus()
      }
    })
  }

  // Insert text at caret position
  const insertAtCaret = (textToInsert: string, deleteCount: number = 0): string => {
    const { start, end } = getCaretPosition()
    const before = input.slice(0, start - deleteCount)
    const after = input.slice(end)
    const newInput = before + textToInsert + after
    const newCaretPos = before.length + textToInsert.length
    setCaretPosition(newCaretPos)
    return newInput
  }

  // Delete at caret position (backspace)
  const deleteAtCaret = (): string => {
    const { start, end } = getCaretPosition()
    if (start !== end) {
      // Delete selection
      const newInput = input.slice(0, start) + input.slice(end)
      setCaretPosition(start)
      return newInput
    } else if (start > 0) {
      // Delete one char before caret
      const newInput = input.slice(0, start - 1) + input.slice(start)
      setCaretPosition(start - 1)
      return newInput
    }
    return input
  }

  const clearAll = () => {
    setInput('')
    onChange?.('')
    resetBuffer()
    setCaretPosition(0)
  }

  const handleKeyPress = (button: string) => {
    if (button === '{1234}') {
      setLayoutName('numberic')
    } else if (button === '{TELEX}') {
      toggleInputMethod('vni')
      setVietnameseLayout((prevLayout) => {
        const newLayout = { ...prevLayout }
        newLayout.default[4] = newLayout.default[4].replace('{TELEX}', '{VNI}')
        newLayout.shift[4] = newLayout.shift[4].replace('{TELEX}', '{VNI}')
        newLayout.specialCharacters[4] = newLayout.specialCharacters[4].replace('{TELEX}', '{VNI}')
        return newLayout
      })
    } else if (button === '{VNI}') {
      toggleInputMethod('telex')
      setVietnameseLayout((prevLayout) => {
        const newLayout = { ...prevLayout }
        newLayout.default[4] = newLayout.default[4].replace('{VNI}', '{TELEX}')
        newLayout.shift[4] = newLayout.shift[4].replace('{VNI}', '{TELEX}')
        newLayout.specialCharacters[4] = newLayout.specialCharacters[4].replace('{VNI}', '{TELEX}')
        return newLayout
      })
    } else if (button === '{abc}') {
      setLayoutName('default')
    } else if (button === '{=/<}') {
      setLayoutName('specialCharacters')
    } else if (button === '{shift}' || button === '{lock}') {
      if (layoutName === 'shift') {
        setLayoutName('default')
      } else setLayoutName('shift')
    } else if (button === '{bksp}') {
      const newInput = deleteAtCaret()
      setInput(newInput)
      onChange?.(newInput)
      resetBuffer()
    } else if (button === '{space}') {
      const newInput = insertAtCaret(' ')
      setInput(newInput)
      onChange?.(newInput)
      resetBuffer()
    } else if (button === '{enter}') {
      // Mark that enter key is being pressed, wait for release
      enterKeyPressedRef.current = true
    } else if (button === '{toggle}') {
      toggleInputMethod()
    } else if (button === '{clear}') {
      clearAll()
    } else if (button === '{done}') {
      // Mark that done key is being pressed, wait for release
      doneKeyPressedRef.current = true
    } else {
      if (maxLength && input.length >= maxLength) {
        return
      }

      // Process Vietnamese input with caret position
      const { start, end } = getCaretPosition()

      // Get the text before caret for Vietnamese processing
      const textBeforeCaret = input.slice(0, start)
      const textAfterCaret = input.slice(end)

      // Process Vietnamese input on the text before caret
      const processedBeforeCaret = processVietnameseInput(button, textBeforeCaret)

      const newInput = processedBeforeCaret + textAfterCaret
      // New caret position is at the end of the processed text before caret
      const newCaretPos = processedBeforeCaret.length

      setInput(newInput)
      onChange?.(newInput)
      setCaretPosition(newCaretPos)
    }

    onKeyPress?.(button)
  }

  // Handle key release - especially for Enter key
  const handleKeyReleased = (button: string) => {
    if (button === '{enter}' && enterKeyPressedRef.current) {
      enterKeyPressedRef.current = false
      if (currentInputRef.current?.tagName === 'INPUT') {
        submitInputValue()
      } else {
        const newInput = insertAtCaret('\n')
        setInput(newInput)
        onChange?.(newInput)
        resetBuffer()
      }
    } else if (button === '{done}' && doneKeyPressedRef.current) {
      doneKeyPressedRef.current = false
      submitInputValue()
      // eventEmitter.emit(EInternalEvents.ADD_TEXT_ON_DONE_KEYBOARD, input)
    }
  }

  // Track caret position when user clicks or uses arrow keys in textarea
  const handleTextAreaSelect = () => {
    const textarea = textDisplayerRef?.current
    if (textarea) {
      caretPositionRef.current = {
        start: textarea.selectionStart ?? 0,
        end: textarea.selectionEnd ?? 0,
      }
    }
  }

  const catchEnterKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Enter for new line, use Ctrl+Enter or Cmd+Enter to submit
    if (e.shiftKey) {
    } else {
      if (e.key === 'Enter') {
        e.preventDefault()
        submitInputValue()
      }
    }
  }

  // Handle keyboard input from textarea (when user types with real keyboard)
  const handleTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Update caret position after key press
    setTimeout(handleTextAreaSelect, 0)
    catchEnterKey(e)
  }

  const handlePickSuggestion = (suggestion: TKeyboardSuggestion) => {
    textFieldControllerRef.current.setValue(suggestion.text)
    onClose?.()
  }

  useEffect(() => {
    if (isOpen) {
      const inputType = currentInputRef.current?.type
      if (inputType === 'number' || inputType === 'tel') {
        setLayoutName('numberic')
      } else {
        setLayoutName('default')
      }
    }
  }, [isOpen])

  return (
    <div className={`${keyboardName} 5xl:text-[26px] w-full shadow-[0_3px_10px_rgba(0,0,0,0.8)]`}>
      {/* Display area - hiển thị nội dung đang nhập */}
      <div className="px-3 py-2 bg-white border-b border-gray-200">
        <AutoSizeTextField
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setTimeout(handleTextAreaSelect, 0)
          }}
          onAllowResizeTextArea={() => {
            if (currentInputRef.current?.tagName === 'TEXTAREA') return true
            return false
          }}
          controllerRef={textFieldControllerRef}
          onEnter={catchEnterKey}
          onKeyDown={handleTextAreaKeyDown}
          onSelect={handleTextAreaSelect}
          onClick={handleTextAreaSelect}
          textfieldRef={textDisplayerRef}
          maxHeight={150}
          minHeight={40}
          className="w-full no-scrollbar outline-transparent focus:outline-main-cl overflow-y-auto px-2 leading-normal py-1.5 text-[1em] border border-gray-200 rounded-lg bg-gray-50 whitespace-pre-wrap wrap-break-word"
        />
      </div>

      <TypingSuggestions
        currentInputRef={currentInputRef}
        onPickSuggestion={handlePickSuggestion}
      />

      {/* Keyboard */}
      <div className="px-2 py-2 bg-white">
        <Keyboard
          key={inputMethod}
          keyboardRef={(r) => {
            keyboardRef.current = r
          }}
          layoutName={layoutName}
          layout={vietnameseLayout}
          display={display}
          onKeyPress={handleKeyPress}
          onKeyReleased={handleKeyReleased}
          buttonTheme={buttonTheme}
          theme="hg-theme-default vietnamese-keyboard-drawer"
          preventMouseDownDefault={true}
        />
      </div>
    </div>
  )
}
