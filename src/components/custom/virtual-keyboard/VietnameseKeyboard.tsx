import { useEffect, useRef, useState } from 'react'
import Keyboard from 'react-simple-keyboard'
import 'simple-keyboard/build/css/index.css'
import { useVietnameseKeyboard } from '@/hooks/use-vietnamese-keyboard'
import '@/styles/virtual-keyboard.css'
import { AutoSizeTextField } from '../AutoSizeTextField'
import { EInternalEvents, eventEmitter } from '@/utils/events'

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
}: TVietnameseKeyboardProps) => {
  const [input, setInput] = useState(initialInputValue)
  const [layoutName, setLayoutName] = useState('default')
  const internalKeyboardRef = useRef<any>(null)
  const keyboardRef = externalKeyboardRef || internalKeyboardRef
  // Track caret position
  const caretPositionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 })
  // Track double tap for done and enter buttons
  const lastTapTimeRef = useRef<{ done: number; enter: number }>({ done: 0, enter: 0 })
  const DOUBLE_TAP_DELAY = 400 // milliseconds
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

  const handleKeyPress = (button: string) => {
    if (button === '{shift}' || button === '{lock}') {
      setLayoutName(layoutName === 'default' ? 'shift' : 'default')
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
      if (currentInputRef.current?.tagName === 'INPUT') {
        submitInputValue()
      } else {
        const newInput = insertAtCaret('\n')
        setInput(newInput)
        onChange?.(newInput)
        resetBuffer()
      }
    } else if (button === '{toggle}') {
      toggleInputMethod()
    } else if (button === '{clear}') {
      setInput('')
      onChange?.('')
      resetBuffer()
      setCaretPosition(0)
    } else if (button === '{done}') {
      submitInputValue()
      eventEmitter.emit(EInternalEvents.ADD_TEXT_ON_DONE_KEYBOARD, input)
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
      if (currentInputRef.current?.tagName === 'INPUT') {
        e.preventDefault()
      }
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

  const vietnameseLayout = {
    default: [
      '1 2 3 4 5 6 7 8 9 0 - = {bksp} {clear}',
      'q w e r t y u i o p [ ] \\',
      "a s d f g h j k l ; ' {enter}",
      '{shift} z x c v b n m , . / {shift}',
      '{space} {done}',
    ],
    shift: [
      '! @ # $ % ^ & * ( ) _ + {bksp} {clear}',
      'Q W E R T Y U I O P { } |',
      'A S D F G H J K L : " {enter}',
      '{shift} Z X C V B N M < > ? {shift}',
      '{space} {done}',
    ],
  }

  const display: Record<string, string> = {
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
        className="lucide lucide-delete-icon lucide-delete"
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
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-arrow-big-up-icon lucide-arrow-big-up"
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
        className="lucide lucide-space-icon lucide-space"
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
        className="lucide lucide-eraser-icon lucide-eraser"
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
        className="lucide lucide-check-icon lucide-check"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    `,
  }

  const buttonTheme = [
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
          onEnter={catchEnterKey}
          onKeyDown={handleTextAreaKeyDown}
          onSelect={handleTextAreaSelect}
          onClick={handleTextAreaSelect}
          textfieldRef={textDisplayerRef}
          maxHeight={150}
          className="w-full outline-transparent focus:outline-main-cl overflow-y-auto px-2 py-1.5 text-[1em] border border-gray-200 rounded-lg bg-gray-50 whitespace-pre-wrap wrap-break-word"
        />
      </div>

      {/* Input method toggle - chuyển đổi VNI/Telex */}
      <div className="text-[0.8em] px-3 py-2 bg-white border-b border-gray-200 flex items-center gap-2">
        <span className="text-gray-600 font-medium">Kiểu gõ:</span>
        <button
          onClick={() => toggleInputMethod('telex')}
          className={`${
            inputMethod === 'telex' ? 'bg-main-cl text-white' : 'text-gray-800'
          } px-3 py-1.5 rounded-lg font-semibold mobile-touch border border-gray-300`}
        >
          TELEX
        </button>
        <button
          onClick={() => toggleInputMethod('vni')}
          className={`${
            inputMethod === 'vni' ? 'bg-main-cl text-white' : 'text-gray-800'
          } px-3 py-1.5 rounded-lg font-semibold mobile-touch border border-gray-300`}
        >
          VNI
        </button>
      </div>

      {/* Keyboard */}
      <div className="px-2 py-2 bg-white">
        <Keyboard
          keyboardRef={(r) => {
            keyboardRef.current = r
          }}
          layoutName={layoutName}
          layout={vietnameseLayout}
          display={display}
          onKeyPress={handleKeyPress}
          buttonTheme={buttonTheme}
          theme="hg-theme-default vietnamese-keyboard-drawer"
          preventMouseDownDefault={true}
        />
      </div>
    </div>
  )
}
