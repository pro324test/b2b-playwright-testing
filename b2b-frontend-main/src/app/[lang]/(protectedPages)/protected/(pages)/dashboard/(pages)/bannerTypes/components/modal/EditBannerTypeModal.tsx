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
import { BannerType } from "@/types/ourApiSepecifc/BannerType";
import { bannerTypesRequests } from "@/types/ourApiSepecifc/bannerTypesRequests";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  bannerType: BannerType;
};

export default function EditBannerTypeModal({
  isOpen,
  setIsOpen,
  bannerType,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(bannerType.name);
  const [description, setDescription] = useState(bannerType.description);
  const [width, setWidth] = useState(`${bannerType.width}`);
  const [height, setHeight] = useState(`${bannerType.height}`);

  const canSubmit =
    name != "" && description != "" && width != "" && height != "";

  const editHandler = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await bannerTypesRequests.edit({
        privateAxios,
        id: bannerType.id,
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
          <DialogTitle className="flex justify-center text-3xl">
            <span>
              Edit Banner Type
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
                  editHandler({
                    name,
                    description,
                    width: +width,
                    height: +height,
                  });
                }}
              >
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    type="number"
                    id="width"
                    placeholder="1200"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    type="text"
                    id="height"
                    placeholder="600"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
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
