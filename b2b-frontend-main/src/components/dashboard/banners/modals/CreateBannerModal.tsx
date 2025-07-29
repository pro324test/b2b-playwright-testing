"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/redux/config/hooks";
import useWebsiteDirection from "@/hooks/useWebsiteDirection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FileInputWithView from "@/components/forms/inputs/FileInputWithView";
import { DateTimePicker } from "@/components/globals/DateTimePicker";
import { bannersRequests } from "@/types/ourApiSepecifc/bannerRequests";
import { Shop } from "@/types/ourApiSepecifc/Shop";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { BannerType } from "@/types/ourApiSepecifc/BannerType";
import { bannerTypesRequests } from "@/types/ourApiSepecifc/bannerTypesRequests";
import IphoneLoader from "@/components/loaders/IphoneLoader";

type Props = {
  shop: Shop;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CreateBannerModal({ shop, isOpen, setIsOpen }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({ contentType: "multipart/form-data" });
  const websiteDirection = useWebsiteDirection();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingBannerTypes, setIsGettingBannerTypes] = useState(false);
  const [bannerTypesResponse, setBannerTypesResponse] =
    useState<PaginatedResponse<BannerType> | null>(null);
  const [selectedBannerTypeId, setSelectedBannerTypeId] = useState<
    number | null
  >(null);

  const canSubmit =
    title && description && image && link && selectedBannerTypeId;

  const handleSubmit = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await bannersRequests.create({
        privateAxios,
        data,
      });
      toastSuccessMessage({ dictionary, response });
      router.refresh();
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
      <DialogContent
        className="min-w-[50%] hide-x-button"
        dir={websiteDirection}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl text-center">
            Create Banner for{" "}
            <span className="text-main-color">{shop.name}</span>
          </DialogTitle>
          <div>
            <div className="mt-12 mb-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading || !canSubmit) return;
                  const formData = new FormData();
                  formData.append("title", title);
                  formData.append("description", description);
                  formData.append("shopId", shop.id.toString());
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
                  handleSubmit(formData);
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
                  <FileInputWithView file={image} setFile={setImage} />
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
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
