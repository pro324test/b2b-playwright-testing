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
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { useRouter } from "next/navigation";
import { ProductVariant } from "@/types/ourApiSepecifc/ProductVariant";
import { productVariantsRequests } from "@/requests/ourApi/productVariantsRequests";

type Props = {
  productVariant: ProductVariant;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function DeleteProductVariantModal({
  productVariant,
  isOpen,
  setIsOpen,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const deleteHandler = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await productVariantsRequests.delete({
        privateAxios,
        id: productVariant.id,
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
            <span className="mb-4">
              {dictionary.areYouSureYouWantToDelete}:{" "}
              <span className="text-blue-600">
                &apos;{productVariant.sku}&apos;
              </span>
            </span>
            <div className="flex flex-wrap gap-4">
              {productVariant.attributeValues.map((attributeValue) => (
                <span
                  key={attributeValue.id}
                  className="flex gap-2 text-lg bg-green-600 text-white py-2 px-6"
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
                  if (isLoading) return;
                  deleteHandler();
                }}
              >
                <div className="mt-8 flex gap-4 items-center justify-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="py-2 px-6 text-2xl rounded-xl text-white bg-red-600 transition-colors hover:bg-red-700"
                  >
                    {isLoading ? dictionary.pleaseWait : dictionary.delete}
                  </button>
                  <button
                    type="button"
                    className="py-2 px-6 text-2xl rounded-xl text-white bg-green-600 transition-colors hover:bg-green-700"
                    disabled={isLoading}
                    onClick={() => {
                      if (isLoading) return;
                      setIsOpen(false);
                    }}
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
