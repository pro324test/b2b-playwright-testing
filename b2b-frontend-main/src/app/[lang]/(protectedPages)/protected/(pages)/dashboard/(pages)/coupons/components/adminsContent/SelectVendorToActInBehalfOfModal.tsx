"use client";

import { Vendor } from "@/types/ourApiSepecifc/Vendor";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { vendorsRequests } from "@/requests/ourApi/vendorsRequests";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import { Label } from "@/components/ui/label";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmitSelectingVendor: (vendor: Vendor) => void;
};

export default function SelectVendorToActInBehalfOfModal({
  isOpen,
  setIsOpen,
  onSubmitSelectingVendor,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [response, setResponse] = useState<PaginatedResponse<Vendor> | null>(
    null
  );
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const canSubmit = selectedVendor !== null;

  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoading(true);
      try {
        const response = await vendorsRequests.getAll({ privateAxios });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchVendors();
    }
    // eslint-disable-next-line
  }, [isOpen]);
  return (
    <Dialog open={isOpen}>
      <DialogContent className="hide-x-button">
        <DialogHeader>
          <DialogTitle>Select Vendor</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <IphoneLoader />
        ) : (
          <div className="grid w-full  items-center gap-1.5 mb-4">
            <Label htmlFor="vendor">Vendor</Label>
            <Select
              value={selectedVendor ? selectedVendor.id.toString() : undefined}
              onValueChange={(newValue) => {
                const vendor = response?.data.find(
                  (vendor) => vendor.id.toString() === newValue
                );
                if (vendor) {
                  setSelectedVendor(vendor);
                }
              }}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select a vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Vendor</SelectLabel>
                  {response?.data.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.user?.username}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter>
          <div className="flex gap-4">
            <button
              disabled={!canSubmit || isLoading}
              className="mt-8 bg-green-600  py-2 px-6 rounded-xl text-white transition-colors hover:bg-green-700"
              onClick={() => {
                if (selectedVendor) {
                  onSubmitSelectingVendor(selectedVendor);
                  setIsOpen(false);
                }
              }}
            >
              {dictionary.confirm}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
