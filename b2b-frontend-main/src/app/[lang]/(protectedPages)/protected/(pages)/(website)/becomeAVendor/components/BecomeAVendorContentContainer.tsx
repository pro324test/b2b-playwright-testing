"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { VendorGroup } from "@/types/ourApiSepecifc/VendorGroup";
import { vendorsRequests } from "@/requests/ourApi/vendorsRequests";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { Input } from "@/components/ui/input";
import FileSelectorInput from "@/components/forms/inputs/FileSelectorInput";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { useRouter } from "nextjs-toploader/app";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";

export default function BecomeAVendorContentContainer() {
  const privateAxios = usePrivateAxios({ contentType: "multipart/form-data" });
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const lang = useLang();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");

  const [selectedVendorGroupId, setSelectedVendorGroupId] = useState<
    number | null
  >(null);

  const [practiceLicenseFile, setPracticeLicenseFile] = useState<File | null>(
    null
  );
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  const [vendorGroupsResponse, setVendorGroupsResponse] =
    useState<PaginatedResponse<VendorGroup> | null>(null);

  const canSubmit =
    name != "" &&
    selectedVendorGroupId != null &&
    practiceLicenseFile != null &&
    licenseFile != null;

  const handleSubmit = useCallback(async (data: FormData) => {
    setIsLoading(true);

    try {
      const response = await vendorsRequests.requestToBecomeAVendor({
        privateAxios,
        data,
      });
      toastSuccessMessage({
        dictionary,
        response,
      });

      router.replace(routes.home.href({ lang }));
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await vendorsRequests.getGroups({
          privateAxios,
        });
        setVendorGroupsResponse(response.data);
      } catch {
        // error
      } finally {
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <LoadingWithOverlay isLoading={isLoading} />
      <div className="padding-x py-8  lg:w-[55rem] mx-auto ">
        <h2 className="text-center font-bold text-2xl mb-20">
          Request To Become A Vendor
        </h2>
        <form
          className="block border border-gray-400 p-8 rounded-lg shadow-md relative"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit || isLoading) return;
            const formData = new FormData();
            formData.append("businessName", name);
            formData.append(
              "requestedGroupId",
              selectedVendorGroupId?.toString() ?? ""
            );
            if (practiceLicenseFile) {
              formData.append("practicePermitDoc", practiceLicenseFile);
            }
            if (licenseFile) {
              formData.append("licenseDoc", licenseFile);
            }
            handleSubmit(formData);
          }}
        >
          <p className="absolute top-[-35px] p-2 rounded-l bg-main-color bg-main-color text-white">
            Info About Vendor
          </p>
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
                setSelectedVendorGroupId(valueAsNumber);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vendor Group" />
              </SelectTrigger>
              <SelectContent>
                {vendorGroupsResponse?.data?.map((vendorGroup) => (
                  <SelectItem key={vendorGroup.id} value={`${vendorGroup.id}`}>
                    {vendorGroup.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="practice-license-file">Practice License File</Label>
            <FileSelectorInput
              file={practiceLicenseFile}
              setFile={setPracticeLicenseFile}
            />
          </div>
          <div className="my-4">
            <Label htmlFor="practice-license-file">License</Label>
            <FileSelectorInput file={licenseFile} setFile={setLicenseFile} />
          </div>
          <button
            className="main-button w-full"
            disabled={!canSubmit || isLoading}
          >
            {" "}
            {dictionary.confirm}
          </button>
        </form>
      </div>
    </>
  );
}
