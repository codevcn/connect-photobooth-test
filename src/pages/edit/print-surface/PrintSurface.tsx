import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { labelToSurfaceType } from '@/utils/helpers'
import { TClientProductVariant, TPrintSurfaceInfo } from '@/utils/types/global'

type TPrintSurfaceProps = {
  printSurfaces: TPrintSurfaceInfo[]
  pickedVariant: TClientProductVariant
}

export const PrintSurface = ({ printSurfaces, pickedVariant }: TPrintSurfaceProps) => {
  const pickedSurface = useProductUIDataStore((s) => s.pickedSurface)

  const handlePickSurface = (
    surfaceId: TPrintSurfaceInfo['id'],
    variantId: TClientProductVariant['id']
  ) => {
    useProductUIDataStore.getState().handlePickSurface(variantId, surfaceId)
  }

  return (
    printSurfaces &&
    printSurfaces.length > 0 && (
      <div className="mt-4">
        <h3 className="text-slate-800 font-bold text-sm mb-2">Mặt in</h3>
        <div className="flex flex-wrap gap-2">
          {printSurfaces.map((surface) => (
            <button
              key={surface.id}
              onClick={() => handlePickSurface(surface.id, pickedVariant.id)}
              className={`px-5 py-1 font-bold rounded-lg transition-all mobile-touch ${
                pickedSurface?.id === surface.id
                  ? 'bg-main-cl border-2 border-main-cl text-white shadow-md'
                  : 'bg-white border-2 border-gray-300 text-slate-700 hover:border-secondary-cl hover:text-secondary-cl'
              }`}
            >
              {labelToSurfaceType(surface.code)}
            </button>
          ))}
        </div>
      </div>
    )
  )
}
