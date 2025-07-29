"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector } from "@/redux/config/hooks";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { useRouter } from "next/navigation";
import { formatFileUrl } from "@/utils/formatFileUrl";
import FileInputWithView from "@/components/forms/inputs/FileInputWithView";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import { createFileFromURL } from "@/utils/createFileFromURL";
import { Banner } from "@/types/ourApiSepecifc/Banner";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { BannerType } from "@/types/ourApiSepecifc/BannerType";
import { bannersRequests } from "@/types/ourApiSepecifc/bannerRequests";
import { DateTimePicker } from "@/components/globals/DateTimePicker";
import { bannerTypesRequests } from "@/types/ourApiSepecifc/bannerTypesRequests";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  banner: Banner;
};

export default function EditBannerModal({ isOpen, setIsOpen, banner }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({ contentType: "multipart/form-data" });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(banner.title);
  const [description, setDescription] = useState(banner.description);
  const [link, setLink] = useState(banner.link || "");
  const [startDate, setStartDate] = useState<Date | undefined>(
    banner.startDate ? new Date(banner.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    banner.endDate ? new Date(banner.endDate) : undefined
  );
  const [image, setImage] = useState<File | null>(null);
  const [isConvertingImageToFile, setIsConvertingImageToFile] = useState(false);
  const [isGettingBannerTypes, setIsGettingBannerTypes] = useState(false);
  const [bannerTypesResponse, setBannerTypesResponse] =
    useState<PaginatedResponse<BannerType> | null>(null);
  const [selectedBannerTypeId, setSelectedBannerTypeId] = useState<
    number | null
  >(banner.bannerTypeId);

  const canSubmit =
    title && description && image && link && selectedBannerTypeId;

  useEffect(() => {
    async function convertLogoToFile() {
      if (banner.imageUrl) {
        try {
          setIsConvertingImageToFile(true);
          const logoFile = await createFileFromURL(
            formatFileUrl(banner.imageUrl),
            "logo.png"
          );
          setImage(logoFile);
        } catch {
          // error
        } finally {
          setIsConvertingImageToFile(false);
        }
      }
    }
    if (isOpen) {
      convertLogoToFile();
    }
    // eslint-disable-next-line
  }, [isOpen]);

  const editHandler = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await bannersRequests.edit({
        privateAxios,
        id: banner.id,
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

  useEffect(() => {
    async function getBannerTypes() {
      setIsGettingBannerTypes(true);
      try {
        const response = await bannerTypesRequests.getAll({
          privateAxios,
          queryParams: { limit: "100" },
        });
        setBannerTypesResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsGettingBannerTypes(false);
      }
    }
    if (isOpen) {
      getBannerTypes();
    }
    // eslint-disable-next-line
  }, [isOpen]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="hide-x-button min-w-[50%] hide-x-buttton">
        <DialogHeader>
          <DialogTitle className="flex justify-center text-3xl">
            <span>
              Edit Banner
              <span className="text-blue-600">&apos;{banner.title}&apos;</span>
            </span>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-4 mb-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading || !canSubmit) return;
                  const formData = new FormData();
                  formData.append("title", title);
                  formData.append("description", description);
                  formData.append("shopId", banner.shopId.toString());
                  formData.append(
                    "bannerTypeId",
                    selectedBannerTypeId!.toString()
                  );
                  if (image) {
                    formData.append("image", image);
                  }
                  if (link) {
                    formData.append("link", link);
                  }
                  if (startDate) {
                    formData.append("startDate", startDate.toISOString());
                  }
                  if (endDate) {
                    formData.append("endDate", endDate.toISOString());
                  }
                  editHandler(formData);
                }}
              >
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    type="text"
                    id="title"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="type">Type</Label>
                  {isGettingBannerTypes ? (
                    <IphoneLoader />
                  ) : (
                    <Select
                      value={selectedBannerTypeId?.toString()}
                      onValueChange={(newValue) => {
                        setSelectedBannerTypeId(Number(newValue));
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Type</SelectLabel>
                          {bannerTypesResponse?.data.map((type) => (
                            <SelectItem
                              key={type.id}
                              value={type.id.toString()}
                            >
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="image">Image</Label>
                  {isConvertingImageToFile ? (
                    <IphoneLoader />
                  ) : (
                    <FileInputWithView file={image} setFile={setImage} />
                  )}
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="link">Link</Label>
                  <Input
                    type="text"
                    id="link"
                    placeholder="www.example.com"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="start-date">Start Date</Label>
                  <DateTimePicker date={startDate} setDate={setStartDate} />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="end-date">End Date</Label>
                  <DateTimePicker date={endDate} setDate={setEndDate} />
                </div>

                <div className="mt-8 flex gap-4 items-center">
                  <button
                    disabled={!canSubmit || isLoading}
                    className=" bg-green-600  py-2 px-6 rounded-xl text-white transition-colors hover:bg-green-700"
                  >
                    {isLoading ? dictionary.pleaseWait : dictionary.confirm}
                  </button>
                  <button
                    type="button"
                    className="py-2 px-6  rounded-xl text-white bg-red-600 transition-colors hover:bg-red-700"
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
