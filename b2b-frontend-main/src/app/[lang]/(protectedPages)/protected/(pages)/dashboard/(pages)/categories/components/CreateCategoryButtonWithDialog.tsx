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
import { Textarea } from "@/components/ui/textarea";
import { categoriesRequests } from "@/requests/ourApi/categoriesRequests";

type Props = {
  categoryId?: number;
};

export default function CreateCategoryButtonWithDialog({ categoryId }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const websiteDirection = useWebsiteDirection();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = name && description;

  const handleSubmit = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await categoriesRequests.create({
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

        <span>
          {" "}
          Create <span>{categoryId ? "Sub " : ""}</span> Category
        </span>
      </DialogTrigger>
      <DialogContent className="min-w-[50%]" dir={websiteDirection}>
        <DialogHeader>
          <DialogTitle className="text-3xl text-center">
            Create Category
          </DialogTitle>
          <div>
            <div className="mt-12 mb-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading || !canSubmit) return;
                  const data: {
                    name: string;
                    description: string;
                    parentId?: number;
                  } = {
                    name,
                    description,
                  };
                  if (categoryId) {
                    data.parentId = categoryId;
                  }
                  handleSubmit(data);
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
