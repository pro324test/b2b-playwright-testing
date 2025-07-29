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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { vendorsRequests } from "@/requests/ourApi/vendorsRequests";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { VendorGroup } from "@/types/ourApiSepecifc/VendorGroup";
import { refreshPageKey } from "@/redux/features/other/otherSlice";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function RequestToBecomeAVendorModal({
  isOpen,
  setIsOpen,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [vendorGroupsResponse, setVendorGroupsResponse] =
    useState<PaginatedResponse<VendorGroup> | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);

  const submitHandler = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await vendorsRequests.requestToBecomeAVendor({
        privateAxios,
        data,
      });
      toastSuccessMessage({ dictionary, response });
      dispatch(refreshPageKey());
      setIsOpen(false);
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await vendorsRequests.getGroups({
          privateAxios,
        });
        setVendorGroupsResponse(response.data);
      } catch {
        // error
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="hide-x-button min-w-[50%] hide-x-buttton">
        <DialogHeader>
          <DialogTitle className="flex justify-center text-3xl">
            <span>Request to become a vendor</span>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-4 mb-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading) return;
                  const data: { name?: string; vendorGroupId?: number } = {};
                  if (name) data.name = name;
                  if (selectedVendorId) data.vendorGroupId = selectedVendorId;
                  submitHandler(data);
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
                  <Label htmlFor="vendor-group">Vendor Group</Label>
                  <Select
                    onValueChange={(value) => {
                      const valueAsNumber = +value;
                      if (isNaN(valueAsNumber)) return;
                      setSelectedVendorId(valueAsNumber);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vendor Group" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorGroupsResponse?.data?.map((vendorGroup) => (
                        <SelectItem
                          key={vendorGroup.id}
                          value={`${vendorGroup.id}`}
                        >
                          {vendorGroup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <button
                    disabled={isLoading}
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
