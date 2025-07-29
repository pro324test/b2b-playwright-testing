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
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { VendorGroup } from "@/types/ourApiSepecifc/VendorGroup";
import { vendorsRequests } from "@/requests/ourApi/vendorsRequests";
import styles from "./styles/RemoveVendorsFromGroupModalStyles.module.css";
import { useRouter } from "next/navigation";

type Props = {
  vendorGroup: VendorGroup;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function RemoveVendorsFromGroupModal({
  vendorGroup,
  isOpen,
  setIsOpen,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([]);
  const router = useRouter();

  const canSubmit = selectedVendorIds.length > 0;

  const removeHandler = useCallback(async (theSelectedVendorIds: number[]) => {
    setIsLoading(true);
    try {
      const response = await vendorsRequests.manageVendorGroup({
        privateAxios,
        vendorGroupId: vendorGroup.id,
        data: {
          operation: "remove",
          vendorIds: theSelectedVendorIds,
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
    // eslint-disable-next-line
  }, []);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="hide-x-button min-w-[50%] hide-x-buttton">
        <DialogHeader>
          <DialogTitle className="flex justify-center text-3xl">
            <span>
              Remove Vendors from Group:{" "}
              <span className="text-blue-600">
                &apos;{vendorGroup.name}&apos;
              </span>
            </span>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-4 mb-2">
              <div className="flex gap-4 flex-wrap">
                {vendorGroup.vendors?.length == 0 ? (
                  <p className="text-2xl font-bold text-center w-full">
                    No Vendors found
                  </p>
                ) : (
                  vendorGroup.vendors?.map((vendor) => {
                    const isSelected = selectedVendorIds.includes(vendor.id);
                    return (
                      <button
                        key={vendor.id}
                        className={`${styles["vendor-item"]} ${
                          isSelected ? styles["selected"] : ""
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedVendorIds((prev) =>
                              prev.filter((id) => id !== vendor.id)
                            );
                          } else {
                            setSelectedVendorIds((prev) => [
                              ...prev,
                              vendor.id,
                            ]);
                          }
                        }}
                      >
                        {vendor.user?.email}
                      </button>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading || !canSubmit) return;
                  removeHandler(selectedVendorIds);
                }}
              >
                <div className="mt-8 flex gap-4 justify-center">
                  <button
                    type="submit"
                    disabled={isLoading || !canSubmit}
                    className="py-2 px-6 text-2xl rounded-xl text-white bg-red-600 transition-colors hover:bg-red-700"
                  >
                    {isLoading ? dictionary.pleaseWait : "Remove Vendors"}
                  </button>
                  <button
                    type="button"
                    className="py-2 px-6 text-2xl rounded-xl text-white bg-green-600 transition-colors hover:bg-green-700"
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
