"use client";

import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/redux/config/hooks";
import useWebsiteDirection from "@/hooks/useWebsiteDirection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FaRegPlusSquare } from "react-icons/fa";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { useRouter } from "next/navigation";
import FileInputWithView from "@/components/forms/inputs/FileInputWithView";
import { slidersRequests } from "@/requests/ourApi/slidersRequests";

export default function CreateSliderButtonWithDialog() {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({ contentType: "multipart/form-data" });
  const websiteDirection = useWebsiteDirection();
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = image != null;

  const handleSubmit = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await slidersRequests.create({
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

  return (
    <Dialog>
      <DialogTrigger
        className={
          "py-2 px-6 bg-green-600 text-white flex gap-4 justify-center items-center"
        }
      >
        <FaRegPlusSquare />

        <span> Create Slider</span>
      </DialogTrigger>
      <DialogContent className="min-w-[50%]" dir={websiteDirection}>
        <DialogHeader>
          <DialogTitle className="text-3xl text-center">
            Create Slider
          </DialogTitle>
          <div>
            <div className="mt-12 mb-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading || !canSubmit) return;
                  const formData = new FormData();
                  formData.append("image", image);
                  if (link) {
                    formData.append("link", link);
                  }
                  handleSubmit(formData);
                }}
              >
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="logo">Logo</Label>
                  <FileInputWithView file={image} setFile={setImage} />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="link">Link</Label>
                  <Input
                    type="url"
                    id="link"
                    placeholder="link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>

                <div className="flex">
                  <button
                    disabled={!canSubmit || isLoading}
                    className="mt-8 bg-green-600  py-2 px-6 rounded-xl text-white transition-colors hover:bg-green-700"
                  >
                    {isLoading ? dictionary.pleaseWait : dictionary.confirm}
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
