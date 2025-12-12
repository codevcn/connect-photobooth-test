import { useEditedElementStore } from '@/stores/element/element.store'
import { createInitialConstants } from '@/utils/contants'
import { useState, useEffect } from 'react'
import { StickerElementMenu } from './Menu'
import { generateUniqueId, getNaturalSizeOfImage } from '@/utils/helpers'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { createPortal } from 'react-dom'
import { useEditAreaStore } from '@/stores/ui/edit-area.store'
import { calculateInitialImageElementPosition } from '../helpers'
import { StickerElementMenuForDesktop } from './Menu-ForDesktop'

type TStickerGroup = {
  name: string
  displayName: string
  stickers: string[]
  loaded: boolean
}

type TStickersModalProps = {
  // onAddSticker: (stickerPath: string) => void
  onClose: () => void
}

const StickersModal = ({ onClose }: TStickersModalProps) => {
  const [stickerGroups, setStickerGroups] = useState<TStickerGroup[]>([])
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(0)
  const [isLoadingGroup, setIsLoadingGroup] = useState<boolean>(false)

  // Khởi tạo danh sách nhóm sticker
  useEffect(() => {
    const groups: TStickerGroup[] = initStickerGroupItems().map((config) => ({
      name: config.name,
      displayName: config.displayName,
      stickers: [],
      loaded: false,
    }))
    setStickerGroups(groups)
  }, [])

  // Load nhóm Couple-cat đầu tiên khi component mount
  useEffect(() => {
    if (stickerGroups.length > 0) {
      const coupleCatIndex = stickerGroups.findIndex((g) => g.name === 'Couple-cat')
      if (coupleCatIndex !== -1 && !stickerGroups[coupleCatIndex].loaded) {
        loadStickerGroup(coupleCatIndex)
      }
    }
  }, [stickerGroups.length])

  // Load stickers của một nhóm
  const loadStickerGroup = async (groupIndex: number) => {
    const group = stickerGroups[groupIndex]
    if (!group || group.loaded) return

    setIsLoadingGroup(true)

    // Tìm config tương ứng
    const config = initStickerGroupItems().find((c) => c.name === group.name)
    if (!config) {
      setIsLoadingGroup(false)
      return
    }

    // Tạo danh sách URL stickers
    const stickers: string[] = []
    for (let i = 1; i <= config.count; i++) {
      stickers.push(`/images/stickers/${config.name}/st-${i}.png`)
    }

    // Cập nhật state
    setStickerGroups((prev) =>
      prev.map((g, idx) =>
        idx === groupIndex
          ? {
              ...g,
              stickers,
              loaded: true,
            }
          : g
      )
    )

    setIsLoadingGroup(false)
  }

  // Xử lý chọn nhóm sticker
  const handleSelectGroup = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex)
    if (!stickerGroups[groupIndex].loaded) {
      loadStickerGroup(groupIndex)
    }
  }

  // Xử lý chọn sticker
  const handleSelectSticker = (path: string) => {
    const elementId = generateUniqueId()
    getNaturalSizeOfImage(
      path,
      (width, height) => {
        const scaleFactor = useEditAreaStore.getState().editAreaScaleValue
        useEditedElementStore.getState().addStickerElement([
          {
            id: elementId,
            path,
            position: calculateInitialImageElementPosition({ height, width }, scaleFactor),
            angle: createInitialConstants<number>('ELEMENT_ROTATION'),
            scale: createInitialConstants<number>('ELEMENT_ZOOM'),
            zindex: createInitialConstants<number>('ELEMENT_ZINDEX'),
            mountType: 'from-new',
          },
        ])
        useElementLayerStore.getState().addElementLayers([
          {
            elementId,
            elementType: 'sticker',
            index: createInitialConstants<number>('ELEMENT_ZINDEX'),
          },
        ])
        useEditedElementStore.getState().selectElement(elementId, 'sticker', path)
        onClose()
      },
      (error) => {}
    )
  }

  const selectedGroup = stickerGroups[selectedGroupIndex]

  return (
    <div className="fixed inset-0 flex items-center justify-center z-99 animate-pop-in p-4">
      <div
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="bg-black/50 absolute inset-0 z-10"
      ></div>
      <div className="flex flex-col bg-white w-full rounded-xl shadow-2xl max-w-[90vw] max-h-[90vh] relative z-20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-1 border-b border-gray-200">
          <h3 className="5xl:text-4xl text-xl font-bold text-gray-800">Thêm nhãn dán</h3>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="p-2 hover:bg-white/80 rounded-full active:scale-95 transition cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-700 h-6 w-6 5xl:w-10 5xl:h-10"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Sticker Groups Tabs */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2 overflow-x-auto gallery-scroll">
            {stickerGroups.map((group, index) => {
              const isSelected = selectedGroupIndex === index
              return (
                <button
                  key={group.name}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectGroup(index)
                  }}
                  className={`shrink-0 cursor-pointer flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-orange-100 border-2 border-orange-500'
                      : 'bg-white border-2 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="5xl:w-24 5xl:h-24 w-12 h-12 flex items-center justify-center">
                    <img
                      src={`/images/stickers/${group.name}/st-1.png`}
                      alt={group.displayName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span
                    className={`5xl:font-bold text-xs font-medium ${
                      isSelected ? 'text-orange-700' : 'text-gray-600'
                    }`}
                  >
                    {group.displayName}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Stickers Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoadingGroup ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-loader-icon lucide-loader animate-spin text-main-cl"
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
              <p className="text-gray-600 font-medium">Đang tải nhãn dán...</p>
            </div>
          ) : selectedGroup && selectedGroup.loaded ? (
            <div className="5xl:grid-cols-7 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {selectedGroup.stickers.map((path, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectSticker(path)
                  }}
                  className="aspect-square cursor-pointer flex items-center justify-center bg-gray-50 hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-300 rounded-xl active:scale-95 transition-all p-2"
                >
                  <img
                    src={path}
                    alt={`${selectedGroup.displayName} ${index + 1}`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Chọn một nhóm nhãn dán để xem</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type TStickerGroupsConfig = {
  name: string
  displayName: string
  count: number
}

// Cấu hình các nhóm sticker
const initStickerGroupItems = (): TStickerGroupsConfig[] => [
  { name: 'Couple-cat', displayName: 'Couple Cat', count: 6 },
  { name: 'BabyWony', displayName: 'Baby Wony', count: 20 },
  { name: 'BrownandFriends', displayName: 'Brown & Friends', count: 20 },
  { name: 'MiMnYam', displayName: 'MiMn Yam', count: 20 },
  { name: 'Piyomaru', displayName: 'Piyomaru', count: 20 },
  { name: 'Pusheen', displayName: 'Pusheen', count: 20 },
  { name: 'ZapyCongSo', displayName: 'Zapy Cồng Sô', count: 20 },
]

type TPickerModalWrapperProps = {
  showStickerPicker: boolean
  setShowStickerPicker: (show: boolean) => void
}

const PickerModalWrapper = ({
  showStickerPicker,
  setShowStickerPicker,
}: TPickerModalWrapperProps) => {
  return (
    <>
      <div className="w-fit">
        <button className="flex flex-col items-center gap-2 rounded-md active:bg-light-orange-cl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-sticker-icon lucide-sticker text-main-cl -rotate-6 w-5 h-5 smd:w-7 smd:h-7 5xl:w-8 5xl:h-8"
          >
            <path d="M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" />
            <path d="M15 3v5a1 1 0 0 0 1 1h5" />
            <path d="M8 13h.01" />
            <path d="M16 13h.01" />
            <path d="M10 16s.8 1 2 1c1.3 0 2-1 2-1" />
          </svg>
        </button>
      </div>

      {showStickerPicker &&
        createPortal(<StickersModal onClose={() => setShowStickerPicker(false)} />, document.body)}
    </>
  )
}

export const StickerMenuWrapper = () => {
  const selectedElement = useEditedElementStore((state) => state.selectedElement)
  const { elementType, elementId } = selectedElement || {}
  const cancelSelectingElement = useEditedElementStore((state) => state.cancelSelectingElement)

  const scrollToSelectedElement = () => {
    // if (elementType !== 'sticker') return
    // if (window.innerWidth < 662) {
    //   document.body
    //     .querySelector('.NAME-print-area-container')
    //     ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // } else {
    //   document.body
    //     .querySelector('.NAME-menu-sticker-element')
    //     ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // }
  }

  useEffect(() => {
    scrollToSelectedElement()
  }, [elementId, elementType])

  return (
    elementType === 'sticker' &&
    elementId && (
      <div className="smd:block hidden w-full">
        <StickerElementMenuForDesktop elementId={elementId} onClose={cancelSelectingElement} />
      </div>
    )
  )
}

export const StickerPicker = () => {
  const [showStickerPicker, setShowStickerPicker] = useState(false)

  return (
    <div
      onClick={() => setShowStickerPicker(true)}
      className="5xl:text-[1.5em] smd:bg-gray-100 bg-white 5xl:py-4 flex px-1 py-2 cursor-pointer items-center justify-center gap-2 flex-1 rounded-md"
    >
      <PickerModalWrapper
        showStickerPicker={showStickerPicker}
        setShowStickerPicker={setShowStickerPicker}
      />
      <p className="5xl:text-[0.7em] smd:text-sm text-xs font-bold text-gray-800 leading-none">
        Thêm nhãn dán
      </p>
    </div>
  )
}
