"use client";

import { Product } from "@/types/ourApiSepecifc/Product";
import SingleProductImagesContent from "./SingleProductImagesContent";
import { useAppSelector } from "@/redux/config/hooks";
import SingleProductPriceRulesContent from "./SingleProductPriceRulesContent";
import SingleProductActionsContainer from "./SingleProductActionsContainer";
import SingleProductTabsContentContainer from "./SingleProductTabsContentContainer";

type Props = {
  product: Product;
};

export default function SingleProductPageContentContainer({ product }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  return (
    <div className="pt-12">
      <div className="padding-x  flex gap-8">
        <SingleProductImagesContent product={product} />
        <div className="w-[50%] flex flex-col ">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <div className="flex gap-4">
            <p className="text-lg font-semibold text-red-500 mt-2 line-through">
              {product.basePrice + 200} {dictionary.LYD}
            </p>
            <p className="text-lg font-semibold text-gray-700 mt-2">
              {product.basePrice} {dictionary.LYD}
            </p>
          </div>
          <p className="mt-2">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Numquam ea
            impedit commodi sint exercitationem suscipit amet, nostrum eligendi
            rem! Error, suscipit sunt excepturi libero corporis magnam maiores
            necessitatibus sed rem!
          </p>
          <SingleProductActionsContainer product={product} />
          {/* price rules */}
          {product.priceRules ? (
            <SingleProductPriceRulesContent priceRules={product.priceRules} />
          ) : (
            ""
          )}
        </div>
      </div>
      <SingleProductTabsContentContainer product={product} />
    </div>
  );
}
