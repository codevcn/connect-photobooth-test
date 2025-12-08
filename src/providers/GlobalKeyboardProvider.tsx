import { useEffect, useCallback, useRef, useState } from 'react'
import { VietnameseKeyboard } from '@/components/custom/virtual-keyboard/VietnameseKeyboard'
import { createPortal } from 'react-dom'
import { useKeyboardStore } from '@/stores/keyboard/keyboard.store'
import { checkIfMobileScreen } from '@/utils/helpers'

export enum ETextFieldNameForKeyBoard {
  VIRLTUAL_KEYBOARD_TEXTFIELD = 'NAME-virltual-keyboard-textfield',
}

export const GlobalKeyboardProvider = () => {
  const isVisible = useKeyboardStore((s) => s.visible)
  const setIsVisible = useKeyboardStore((s) => s.setIsVisible)
  const currentInputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null)
  const keyboardRef = useRef<any>(null)
  const keyboardName: string = 'NAME-vietnamese-virtual-keyboard'
  const textDisplayerRef = useRef<HTMLTextAreaElement | null>(null)
  const [initialInputValue, setInitialInputValue] = useState('')

  const showKeyboard = useCallback((input: HTMLInputElement | HTMLTextAreaElement) => {
    if (input.classList.contains(ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD)) {
      setIsVisible(true)
      currentInputRef.current = input
    }
  }, [])

  const hideKeyboard = useCallback(() => {
    setIsVisible(false)
    currentInputRef.current = null
  }, [])

  // Xử lý khi input được focus
  const handleFocus = useCallback(
    (e: FocusEvent) => {
      if (checkIfMobileScreen()) return // Không hiện bàn phím ảo trên mobile
      const target = e.target as HTMLElement
      // Kiểm tra xem element có phải là input/textarea không
      if (target.tagName === 'INPUT') {
        showKeyboard(target as HTMLInputElement)
        setInitialInputValue((target as HTMLInputElement).value)
      } else if (target.tagName === 'TEXTAREA') {
        showKeyboard(target as HTMLTextAreaElement)
        setInitialInputValue((target as HTMLTextAreaElement).value)
      }
    },
    [showKeyboard]
  )

  // Xử lý khi input bị blur
  // const handleBlur = useCallback(
  //   (e: FocusEvent) => {
  //     const target = e.target as HTMLElement
  //     const relatedTarget = e.relatedTarget as HTMLElement

  //     // Chỉ xử lý nếu blur từ input ĐANG được bàn phím phục vụ
  //     if (target !== currentInputRef.current) {
  //       return
  //     }

  //     // Không ẩn bàn phím nếu click vào bàn phím
  //     if (relatedTarget && relatedTarget.closest(`.${keyboardName}`)) {
  //       return
  //     }

  //     // Delay để xử lý click vào button trên bàn phím
  //     setTimeout(() => {
  //       const latestCurrentInput = currentInputRef.current
  //       if (
  //         (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
  //         document.activeElement !== target &&
  //         target === latestCurrentInput
  //       ) {
  //         hideKeyboard()
  //       }
  //     }, 100)
  //   },
  //   [hideKeyboard]
  // )

  const hideKeyboardIfOnMobile = useCallback(() => {
    if (checkIfMobileScreen()) {
      hideKeyboard()
    }
  }, [hideKeyboard])

  // Đăng ký event listeners
  useEffect(() => {
    document.addEventListener('focusin', handleFocus as EventListener)
    // document.addEventListener('focusout', handleBlur as EventListener)
    window.addEventListener('resize', hideKeyboardIfOnMobile)

    return () => {
      document.removeEventListener('focusin', handleFocus as EventListener)
      // document.removeEventListener('focusout', handleBlur as EventListener)
      window.removeEventListener('resize', hideKeyboardIfOnMobile)
    }
  }, [handleFocus])

  useEffect(() => {
    if (isVisible && textDisplayerRef.current) {
      textDisplayerRef.current.focus()
    }
  }, [isVisible])

  // Xử lý khi bàn phím đang được nhập
  const handleKeyboardEditing = useCallback((inputValue: string) => {
    const currentInput = currentInputRef.current
    if (!currentInput) return

    // Cập nhật giá trị của input
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      currentInput.constructor.prototype,
      'value'
    )?.set

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(currentInput, inputValue)

      // Trigger input event để React nhận biết thay đổi
      const event = new Event('input', { bubbles: true })
      currentInput.dispatchEvent(event)
    }

    const virtualKeyboardInput = textDisplayerRef.current
    if (!virtualKeyboardInput) return

    // Cập nhật giá trị của input
    const virtualInputValueSetter = Object.getOwnPropertyDescriptor(
      virtualKeyboardInput.constructor.prototype,
      'value'
    )?.set

    if (virtualInputValueSetter) {
      virtualInputValueSetter.call(virtualKeyboardInput, inputValue)

      // Trigger input event để React nhận biết thay đổi
      const event = new Event('input', { bubbles: true })
      virtualKeyboardInput.dispatchEvent(event)
    }
  }, [])

  const handleSubmitEditing = useCallback((finalValue: string) => {
    const currentInput = currentInputRef.current
    if (currentInput) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        currentInput.constructor.prototype,
        'value'
      )?.set

      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(currentInput, finalValue)
        const event = new Event('input', { bubbles: true })
        currentInput.dispatchEvent(event)
      }
    }
    hideKeyboard()
  }, [])

  // const handleCloseKeyboard = useCallback(() => {
  //   const currentInput = currentInputRef.current
  //   if (currentInput && keyboardRef.current) {
  //     const value = keyboardRef.current.getInput()
  //     // Set value cho input
  //     const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  //       currentInput.constructor.prototype,
  //       'value'
  //     )?.set

  //     if (nativeInputValueSetter) {
  //       nativeInputValueSetter.call(currentInput, value)
  //       const event = new Event('input', { bubbles: true })
  //       currentInput.dispatchEvent(event)
  //     }
  //   }
  //   hideKeyboard()
  // }, [hideKeyboard])

  // Đồng bộ giá trị khi input thay đổi từ keyboard thật
  useEffect(() => {
    const currentInput = currentInputRef.current
    if (!currentInput) return
    const keyboard = keyboardRef.current
    if (!keyboard) return

    const handleInputChange = () => {
      if (keyboard) {
        keyboard.setInput(currentInput.value)
      }
    }

    currentInput.addEventListener('input', handleInputChange)
    return () => {
      currentInput.removeEventListener('input', handleInputChange)
    }
  }, [isVisible])

  // Set giá trị ban đầu khi focus vào input có sẵn nội dung
  useEffect(() => {
    const currentInput = currentInputRef.current
    if (currentInput && keyboardRef.current) {
      keyboardRef.current.setInput(currentInput.value || '')
    }
    if (!isVisible) {
      // khi ẩn bàn phím thì set data attribute về false sau 2s (để tránh làm modal ở trang thanh toán bị ảnh hưởng)
      setTimeout(() => {
        const virtualKeyboardWrapper = document.querySelector<HTMLElement>(
          '.NAME-virtual-keyboard-wrapper'
        )
        if (virtualKeyboardWrapper) {
          virtualKeyboardWrapper.setAttribute('data-virtual-keyboard-shown', 'false')
        }
      }, 1000)
    }
  }, [isVisible])

  return (
    <>
      {createPortal(
        <div
          style={{
            display: isVisible ? 'block' : 'none',
          }}
          data-virtual-keyboard-shown={isVisible ? 'true' : 'unknown'}
          className="NAME-virtual-keyboard-wrapper animate-fade-in fixed left-0 bottom-0 w-full h-fit z-9999"
        >
          {isVisible && (
            <div className="bg-white border-t border-gray-200 shadow-2xl">
              <VietnameseKeyboard
                onChange={handleKeyboardEditing}
                onSubmit={handleSubmitEditing}
                keyboardRef={keyboardRef}
                keyboardName={keyboardName}
                textDisplayerRef={textDisplayerRef}
                initialInputValue={initialInputValue}
                currentInputRef={currentInputRef}
              />
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
