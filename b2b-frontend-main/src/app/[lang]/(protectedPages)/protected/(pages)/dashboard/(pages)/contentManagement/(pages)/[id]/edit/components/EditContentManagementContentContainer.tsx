"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentManagmentType } from "@/types/ourApiSepecifc/ContentManagementType";
import { contentManagementTypesRequests } from "@/requests/ourApi/contentManagementTypesRequests";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { useAppSelector } from "@/redux/config/hooks";
import ImageInForm from "@/components/globals/ImageInForm";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import { contentManagementRequests } from "@/requests/ourApi/contentManagementRequests";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { useRouter } from "nextjs-toploader/app";
import { ContentManagement } from "@/types/ourApiSepecifc/ContentManagement";
import Image from "next/image";
import { formatFileUrl } from "@/utils/formatFileUrl";

type Props = {
  contentManagement: ContentManagement;
};

export default function EditContentManagementContentContainer({
  contentManagement,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const lang = useLang();
  const privateAxios = usePrivateAxios({ contentType: "multipart/form-data" });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(contentManagement.title);
  const [description, setDescription] = useState(contentManagement.description);
  const [backgroundColor, setBackgroundColor] = useState(
    contentManagement.backgroundColor || ""
  );
  const [contentManagementTypes, setContentManagementTypes] = useState<
    ContentManagmentType[]
  >([]);
  const [selectedContentTypeId, setSelectedContentTypeId] = useState<
    number | null
  >(contentManagement.typeId);
  const [link, setLink] = useState(contentManagement.link || "");
  const [images, setImages] = useState<{ file: File; id: number }[]>([]);
  const [imageIdsToDelete, setImageIdsToDelete] = useState<number[]>([]);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleXClick = useCallback((id: number) => {
    setImages((prevState) => prevState.filter((image) => image.id !== id));
  }, []);

  const canSubmit = title && description && selectedContentTypeId;

  const submitHandler = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await contentManagementRequests.edit({
        privateAxios,
        id: contentManagement.id,
        data,
      });
      toastSuccessMessage({
        dictionary,
        response,
      });
      router.push(routes.dashboardContentManagement.href({ lang }));
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    async function getContentManagementTypes() {
      try {
        const response = await contentManagementTypesRequests.getAll({
          queryParams: { limit: "1000" },
        });
        setContentManagementTypes(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      }
    }
    getContentManagementTypes();
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <LoadingWithOverlay isLoading={isLoading} />
      <div className="mb-4">
        <HeadingTitle label={`Create Content`} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(400px,_1fr))] gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="background-color">Background Color</Label>
            <Input
              type="text"
              id="background-color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="link">Link</Label>
            <Input
              type="url"
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="content-management-type">
              Content Management Type
            </Label>
            <Select
              value={`${selectedContentTypeId}`}
              onValueChange={(newValue) => {
                setSelectedContentTypeId(+newValue);
              }}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select a Content Management Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Content Management Type</SelectLabel>
                  {contentManagementTypes.map((contentManagementType) => (
                    <SelectItem
                      key={contentManagementType.id}
                      value={`${contentManagementType.id}`}
                    >
                      {contentManagementType.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        {contentManagement.images?.length ? (
          <>
            <div className="mt-8">
              <p className="text-2xl font-bold mb-4">Delete Existing Images</p>
              <div className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-8">
                {contentManagement.images.map((image) => (
                  <button
                    key={image.id}
                    className={`h-[200px] overflow-hidden border-2 ${
                      imageIdsToDelete.includes(image.id)
                        ? "border-red-600 opacity-70"
                        : "border-green-600"
                    } `}
                    onClick={(e) => {
                      e.preventDefault();
                      if (imageIdsToDelete.includes(image.id)) {
                        setImageIdsToDelete((prevState) =>
                          prevState.filter((id) => id !== image.id)
                        );
                      } else {
                        setImageIdsToDelete((prevState) => [
                          ...prevState,
                          image.id,
                        ]);
                      }
                    }}
                  >
                    <Image
                      src={formatFileUrl(image.imageUrl)}
                      alt={"Content Management"}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          ""
        )}
        <div className="mt-8">
          <div className="flex justify-between items-center my-8">
            <button
              className="py-2 px-6 bg-blue-600 text-white transition-colors hover:bg-blue-700"
              onClick={() => {
                if (inputFileRef.current) {
                  inputFileRef.current.click();
                }
              }}
            >
              {images.length ? "Add More Images" : "Add Images"}
            </button>
          </div>
          {images.length ? (
            <div className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-8">
              {images.map((image) => {
                return (
                  <ImageInForm
                    key={image.id}
                    id={image.id}
                    file={image.file}
                    onXClick={(imageId) => handleXClick(imageId)}
                  />
                );
              })}
            </div>
          ) : (
            ""
          )}
        </div>
        <input
          hidden
          ref={inputFileRef}
          type="file"
          multiple
          onChange={(e) => {
            if (e.target.files?.length) {
              const newImages: { id: number; file: File }[] = [];
              for (let i = 0; i < e.target.files.length; i++) {
                newImages.push({
                  file: e.target.files[i],
                  id: Math.random(),
                });
              }
              setImages((prevState) => [...prevState, ...newImages]);
            }
          }}
        />
        <button
          type="button"
          disabled={!canSubmit || isLoading}
          className="py-2 px-6 mt-8 bg-green-600 text-white transition-colors hover:bg-green-700"
          onClick={() => {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("isPublished", "true");
            formData.append("typeId", `${selectedContentTypeId}`);
            if (imageIdsToDelete.length) {
              imageIdsToDelete.forEach((imageId) => {
                formData.append("deleteImageIds[]", `${imageId}`);
              });
            }
            if (backgroundColor) {
              formData.append("backgroundColor", backgroundColor);
            }
            if (link) {
              formData.append("link", link);
            }
            images.forEach((image) => {
              formData.append("images", image?.file);
            });

            submitHandler(formData);
          }}
        >
          Edit Content Management
        </button>
      </form>
    </>
  );
}
