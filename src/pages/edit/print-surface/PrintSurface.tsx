import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { labelToSurfaceType } from '@/utils/helpers'
import { TClientProductVariant, TPrintAreaInfo } from '@/utils/types/global'

type TPrintSurfaceProps = {
  printSurfaces: TPrintAreaInfo[]
  pickedVariant: TClientProductVariant
}

export const PrintSurface = ({ printSurfaces, pickedVariant }: TPrintSurfaceProps) => {
  const isOutOfStock = pickedVariant.stock <= 0
  const pickedSurface = useProductUIDataStore((s) => s.pickedSurface)

  const handlePickSurface = (
    surfaceId: TPrintAreaInfo['id'],
    variantId: TClientProductVariant['id']
  ) => {
    useProductUIDataStore.getState().handlePickVariantSurface(variantId, surfaceId)
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
              onClick={() => !isOutOfStock && handlePickSurface(surface.id, pickedVariant.id)}
              disabled={isOutOfStock}
              className={`px-5 py-1 font-bold rounded-lg transition-all mobile-touch ${
                isOutOfStock
                  ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed line-through'
                  : pickedSurface?.id === surface.id
                  ? 'bg-main-cl border-2 border-main-cl text-white shadow-md'
                  : 'bg-white border-2 border-gray-300 text-slate-700 hover:border-secondary-cl hover:text-secondary-cl'
              }`}
            >
              {labelToSurfaceType(surface.surfaceType)}
            </button>
          ))}
        </div>
      </div>
    )
  )
}
