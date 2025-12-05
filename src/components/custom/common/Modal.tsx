import { cn } from '@/configs/ui/tailwind-utils'

type TModalProps = {
  onClose: () => void
  children: React.JSX.Element
} & Partial<{
  title: string
  classNames: Partial<{
    board: string
    contentContainer: string
    titleContainer: string
    rootModal: string
  }>
}>

export const Modal = ({ onClose, children, title, classNames }: TModalProps) => {
  return (
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center z-90 animate-pop-in p-4',
        classNames?.rootModal
      )}
    >
      <div onClick={onClose} className="bg-black/50 absolute inset-0 z-10"></div>
      <div
        className={cn(
          'flex flex-col bg-white rounded-lg shadow-xl max-h-[99vh] relative z-20',
          classNames?.board
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between px-4 py-2 border-b border-gray-200 rounded-t-lg',
            classNames?.titleContainer
          )}
        >
          <h3 className="font-bold text-inherit">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/40 rounded-full active:scale-95 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 5xl:w-10 5xl:h-10"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className={cn('px-2 py-2 rounded-b-lg', classNames?.contentContainer)}>{children}</div>
      </div>
    </div>
  )
}
