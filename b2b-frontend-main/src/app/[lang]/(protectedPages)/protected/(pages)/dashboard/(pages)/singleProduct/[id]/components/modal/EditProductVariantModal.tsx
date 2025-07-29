"use client";

import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/redux/config/hooks";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { useRouter } from "next/navigation";
import { ProductVariant } from "@/types/ourApiSepecifc/ProductVariant";
import { productVariantsRequests } from "@/requests/ourApi/productVariantsRequests";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  productVariant: ProductVariant;
};

export default function EditProductVariantModal({
  isOpen,
  setIsOpen,
  productVariant,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sku, setSku] = useState(productVariant.sku);
  const [price, setPrice] = useState(
    productVariant.price ? `${productVariant.price}` : ""
  );
  const [quantity, setQuantity] = useState(`${productVariant.quantity}`);
  const [lowStockThreshold, setLowStockThreshold] = useState(
    `${productVariant.lowStockThreshold}`
  );

  const canSubmit = sku && quantity && lowStockThreshold;

  const editHandler = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await productVariantsRequests.edit({
        privateAxios,
        productVariantId: productVariant.id,
        data,
      });
      toastSuccessMessage({ dictionary, response });
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);
  return (
    <Dialog open={isOpen}>
      <DialogContent className="hide-x-button min-w-[50%] hide-x-buttton">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center justify-center text-3xl">
            <span className="mb-4">Edit Variant</span>
            <div className="flex flex-wrap gap-4">
              {productVariant.attributeValues.map((attributeValue) => (
                <span
                  key={attributeValue.id}
                  className="flex gap-2 text-lg bg-green-600 text-white py-2 px-6 rounded-lg"
                >
                  <span>{attributeValue?.attribute?.name}:</span>{" "}
                  <span>{attributeValue.value}</span>
                </span>
              ))}
            </div>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-4 mb-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading || !canSubmit) return;
                  const data: any = {
                    sku,
                    quantity: +quantity,
                    lowStockThreshold: +lowStockThreshold,
                  };
                  if (price) {
                    data.price = +price;
                  }
                  editHandler(data);
                }}
              >
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    type="text"
                    id="sku"
                    placeholder="SKU"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    type="number"
                    id="price"
                    placeholder="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    type="number"
                    id="quantity"
                    placeholder="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="low-stock-threshold">
                    Low Stock Threshold
                  </Label>
                  <Input
                    type="number"
                    id="low-stock-threshold"
                    placeholder="Low Stock Threshold"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    disabled={!canSubmit || isLoading}
                    className="mt-8 bg-green-600  py-2 px-6 rounded-xl text-white transition-colors hover:bg-green-700"
                  >
                    {isLoading ? dictionary.pleaseWait : dictionary.confirm}
                  </button>
                  <button
                    disabled={isLoading}
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="mt-8 bg-red-600  py-2 px-6 rounded-xl text-white transition-colors hover:bg-red-700"
                  >
                    {dictionary.cancel}
                  </button>
                </div>
              </form>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
