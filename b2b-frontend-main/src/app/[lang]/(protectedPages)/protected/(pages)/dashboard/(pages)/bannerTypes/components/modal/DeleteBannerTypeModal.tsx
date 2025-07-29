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
import { BannerType } from "@/types/ourApiSepecifc/BannerType";
import { bannerTypesRequests } from "@/types/ourApiSepecifc/bannerTypesRequests";

type Props = {
  bannerType: BannerType;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function DeleteBannerTypeModal({
  bannerType,
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
      const response = await bannerTypesRequests.delete({
        privateAxios,
        id: bannerType.id,
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
          <DialogTitle className="flex justify-center text-3xl">
            <span>
              {dictionary.areYouSureYouWantToDelete}:{" "}
              <span className="text-blue-600">
                &apos;{bannerType.name}&apos;
              </span>
            </span>
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
