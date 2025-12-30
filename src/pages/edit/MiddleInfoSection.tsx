import { checkIfMobileScreen, formatNumberWithCommas, friendlyCurrency } from '@/utils/helpers'
import { TBaseProduct, TClientProductVariant } from '@/utils/types/global'
import { VariantInfo } from './product/VariantInfo'

type TProductDetailsProps = {
  pickedProduct: TBaseProduct
  pickedVariant: TClientProductVariant
}

export const MiddleInfoSection = ({ pickedProduct, pickedVariant }: TProductDetailsProps) => {
  return (
    <div className="smd:hidden flex flex-col items-center p-1 py-2 pl-2 border-t border-gray-200">
      <div className="mb-1">
        <h1 className="leading-tight text-[1em] text-center text-slate-900">
          {pickedProduct.name}
        </h1>
      </div>

      <div className="flex flex-col items-center relative">
        <span className="absolute top-1/2 -translate-y-1/2 right-[calc(100%+5px)] h-0.5 w-5 bg-main-cl"></span>
        <span className="text-base text-main-cl">
          <span className="font-bold">
            {formatNumberWithCommas(pickedVariant.priceAmountOneSide)}
          </span>
          <span className="text-base font-medium ml-1">
            {friendlyCurrency(pickedVariant.currency)}
          </span>
        </span>
        <span className="absolute top-1/2 -translate-y-1/2 left-[calc(100%+5px)] h-0.5 w-5 bg-main-cl"></span>
      </div>

      {checkIfMobileScreen() && (
        <VariantInfo
          pickedProduct={pickedProduct}
          pickedVariant={pickedVariant}
          type="display-in-middle-info-section"
        />
      )}
    </div>
  )
}
