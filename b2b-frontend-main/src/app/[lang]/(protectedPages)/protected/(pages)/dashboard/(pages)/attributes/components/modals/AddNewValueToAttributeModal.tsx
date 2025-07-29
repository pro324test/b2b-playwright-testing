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
import { Attribute } from "@/types/ourApiSepecifc/Attribute";
import { attributesRequests } from "@/requests/ourApi/attributesRequests";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  attribute: Attribute;
};

export default function AddNewValueToAttributeModal({
  isOpen,
  setIsOpen,
  attribute,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");
  const [hexValue, setHexValue] = useState("");

  const canSubmit = value;

  const submitHandler = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await attributesRequests.createValue({
        privateAxios,
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
              Create Value For Attribute
              <span className="text-blue-600">
                &apos;{attribute.name}&apos;
              </span>
            </span>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-4 mb-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading) return;
                  const data: {
                    value: string;
                    attributeId: number;
                    hexValue?: string;
                  } = { value, attributeId: attribute.id };
                  if (hexValue) data.hexValue = hexValue;
                  submitHandler(data);
                }}
              >
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    type="text"
                    id="value"
                    placeholder="value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="hex-value">Hex Value (Optional)</Label>
                  <Input
                    type="text"
                    id="hex-value"
                    placeholder="#ffffff"
                    value={hexValue}
                    onChange={(e) => setHexValue(e.target.value)}
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
