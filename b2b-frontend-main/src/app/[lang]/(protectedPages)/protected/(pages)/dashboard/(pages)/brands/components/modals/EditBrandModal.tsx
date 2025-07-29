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
import { Textarea } from "@/components/ui/textarea";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { useRouter } from "next/navigation";

import { Brand } from "@/types/ourApiSepecifc/Brand";
import { brandsRequest } from "@/requests/ourApi/brandsRequests";
import { formatFileUrl } from "@/utils/formatFileUrl";
import FileInputWithView from "@/components/forms/inputs/FileInputWithView";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import { createFileFromURL } from "@/utils/createFileFromURL";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  brand: Brand;
};

export default function EditBrandModaal({ isOpen, setIsOpen, brand }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({ contentType: "multipart/form-data" });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(brand.name);
  const [description, setDescription] = useState(brand.description);
  const [isConvertingLogoToFile, setIsConvertingLogoToFile] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);

  useEffect(() => {
    async function convertLogoToFile() {
      if (brand.logo) {
        try {
          setIsConvertingLogoToFile(true);
          const logoFile = await createFileFromURL(
            formatFileUrl(brand.logo),
            "logo.png"
          );
          setLogo(logoFile);
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

  const canSubmit = name && description && logo;

  const editHandler = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await brandsRequest.edit({
        privateAxios,
        id: brand.id,
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
              Edit Brand
              <span className="text-blue-600">&apos;{brand.name}&apos;</span>
            </span>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-4 mb-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading) return;
                  if (!canSubmit) return;

                  const formData = new FormData();
                  formData.append("name", name);
                  formData.append("description", description);
                  formData.append("logo", logo as Blob);
                  editHandler(formData);
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
                  <Label htmlFor="logo">Logo</Label>
                  {isConvertingLogoToFile ? (
                    <IphoneLoader />
                  ) : (
                    <FileInputWithView file={logo} setFile={setLogo} />
                  )}
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
