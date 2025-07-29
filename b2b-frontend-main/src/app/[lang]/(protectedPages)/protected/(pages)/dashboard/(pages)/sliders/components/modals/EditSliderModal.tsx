"use client";

import React, { useCallback, useEffect, useState } from "react";
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

import { formatFileUrl } from "@/utils/formatFileUrl";
import FileInputWithView from "@/components/forms/inputs/FileInputWithView";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import { createFileFromURL } from "@/utils/createFileFromURL";
import { Slider } from "@/types/ourApiSepecifc/Slider";
import { slidersRequests } from "@/requests/ourApi/slidersRequests";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  slider: Slider;
};

export default function EditSliderModal({ isOpen, setIsOpen, slider }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({ contentType: "multipart/form-data" });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isConvertingLogoToFile, setIsConvertingLogoToFile] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [link, setLink] = useState(slider.link || "");

  useEffect(() => {
    async function convertLogoToFile() {
      if (slider.imageUrl) {
        try {
          setIsConvertingLogoToFile(true);
          const logoFile = await createFileFromURL(
            formatFileUrl(slider.imageUrl),
            "slider-image.png"
          );
          setImage(logoFile);
        } catch {
          // error
        } finally {
          setIsConvertingLogoToFile(false);
        }
      }
    }
    if (isOpen) {
      convertLogoToFile();
    }
    // eslint-disable-next-line
  }, [isOpen]);

  const canSubmit = image != null;

  const editHandler = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await slidersRequests.edit({
        privateAxios,
        id: slider.id,
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
            <span>Edit Slider</span>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-4 mb-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading) return;
                  if (!canSubmit) return;

                  const formData = new FormData();
                  formData.append("image", image!);
                  if (link) {
                    formData.append("link", link);
                  }
                  editHandler(formData);
                }}
              >
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="logo">Logo</Label>
                  {isConvertingLogoToFile ? (
                    <IphoneLoader />
                  ) : (
                    <FileInputWithView file={image} setFile={setImage} />
                  )}
                </div>

                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="link">Link</Label>
                  <Input
                    type="url"
                    id="link"
                    placeholder="Link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
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
