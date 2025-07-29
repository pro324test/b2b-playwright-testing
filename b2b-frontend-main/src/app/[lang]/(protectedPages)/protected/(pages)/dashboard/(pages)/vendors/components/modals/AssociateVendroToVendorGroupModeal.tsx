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
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { Vendor } from "@/types/ourApiSepecifc/Vendor";
import { vendorsRequests } from "@/requests/ourApi/vendorsRequests";
import { VendorGroup } from "@/types/ourApiSepecifc/VendorGroup";
import { Label } from "@/components/ui/label";
import SelectWithSearch from "@/components/globals/SelectWithSearch";
import { AxiosResponse } from "axios";
import { SelectWithSearchData } from "@/types/global/SelectWithSearchData";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { useRouter } from "next/navigation";

type Props = {
  vendor: Vendor;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AssociateVendroToVendorGroupModeal({
  vendor,
  isOpen,
  setIsOpen,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const router = useRouter();
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVendorGroup, setSelectedVendorGroup] =
    useState<VendorGroup | null>(null);
  const [vendorGroupsOptions, setVendorGroupsOptions] = useState<
    SelectWithSearchData<VendorGroup>[]
  >([]);

  const submitHandler = useCallback(
    async ({ vendorGroupId }: { vendorGroupId: number }) => {
      setIsLoading(true);
      try {
        const response = await vendorsRequests.manageVendorGroup({
          privateAxios,
          vendorGroupId,
          data: {
            operation: "add",
            vendorIds: [vendor.id],
          },
        });
        toastSuccessMessage({ dictionary, response });
        router.refresh();
        setIsOpen(false);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line
    []
  );

  useEffect(() => {
    if (isOpen) {
      const fetchVendorGroups = async () => {
        try {
          const response: AxiosResponse<PaginatedResponse<VendorGroup>> =
            await vendorsRequests.getGroups({
              privateAxios,
            });
          setVendorGroupsOptions(
            response.data.data.map((group) => ({
              label: group.name,
              value: group.name,
              complexValue: group,
              id: group.id,
            }))
          );
        } catch (error) {
          extractErrorAndToastIt({ error, dictionary });
        }
      };
      fetchVendorGroups();
    }
    // eslint-disable-next-line
  }, [isOpen]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="hide-x-button min-w-[50%] hide-x-buttton">
        <DialogHeader>
          <DialogTitle className="flex justify-center text-3xl">
            <span>Associate Vendor to Vendor Group</span>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-4 mb-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading || !selectedVendorGroup) return;
                  submitHandler({ vendorGroupId: selectedVendorGroup.id });
                }}
              >
                <div className="flex flex-col gap-2">
                  <Label>Vendor Group</Label>
                  <SelectWithSearch
                    data={vendorGroupsOptions}
                    isLoading={isLoading}
                    placeholder="Select Vendor Group"
                    setSelectedValue={setSelectedVendorGroup}
                  />
                </div>
                <div className="mt-8 flex gap-4 items-center">
                  <button
                    type="submit"
                    disabled={!selectedVendorGroup || isLoading}
                    className="py-2 px-6 text-2xl rounded-xl text-white bg-green-600 transition-colors hover:bg-green-700"
                  >
                    {isLoading ? dictionary.pleaseWait : "Associate"}
                  </button>
                  <button
                    type="button"
                    className="py-2 px-6 text-2xl rounded-xl text-white bg-red-600 transition-colors hover:bg-red-700"
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
