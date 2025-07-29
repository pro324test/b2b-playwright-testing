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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector } from "@/redux/config/hooks";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { useRouter } from "next/navigation";
import { City } from "@/types/ourApiSepecifc/City";
import { citiesRequests } from "@/requests/ourApi/citiesRequests";
import { ShopAddress } from "@/types/ourApiSepecifc/ShopAddress";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { shopAddressesRequests } from "@/requests/ourApi/shopAddressesRequest";
import IphoneLoader from "@/components/loaders/IphoneLoader";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  shopAddress: ShopAddress;
};

export default function EditShopAddressModal({
  isOpen,
  setIsOpen,
  shopAddress,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const router = useRouter();
  const [street, setStreet] = useState(shopAddress.street);
  const [notes, setNotes] = useState(shopAddress.notes || "");
  const [isGettingCities, setIsGettingCities] = useState(false);
  const [citiesResponse, setCitiesResponse] =
    useState<PaginatedResponse<City> | null>(null);
  const [cityId, setCityId] = useState<number | null>(shopAddress.cityId);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = street != "" && cityId != null;

  const editHandler = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await shopAddressesRequests.updateAddress({
        privateAxios,
        addressId: shopAddress.id,
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

  useEffect(() => {
    async function getCities() {
      setIsGettingCities(true);
      try {
        const response = await citiesRequests.getAll({
          queryParams: {
            limit: "200",
          },
        });
        setCitiesResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsGettingCities(false);
      }
    }
    getCities();
    // eslint-disable-next-line
  }, []);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="hide-x-button min-w-[50%] hide-x-buttton">
        <DialogHeader>
          <DialogTitle className="flex justify-center text-3xl">
            <span>
              Edit Shop Address
              <span className="text-blue-600">
                &apos;{shopAddress.street}&apos;
              </span>
            </span>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-4 mb-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = {
                    street,
                    notes,
                    cityId,
                    shopId: shopAddress.shopId,
                  };
                  editHandler(data);
                }}
              >
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    type="text"
                    id="street"
                    placeholder="Ain Zara"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    type="text"
                    id="notes"
                    placeholder="Business hours: 9 AM - 5 PM"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  {isGettingCities ? (
                    <IphoneLoader />
                  ) : (
                    <Select
                      value={`${cityId}`}
                      onValueChange={(newValue) => {
                        setCityId(+newValue);
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Cities</SelectLabel>
                          {citiesResponse?.data.map((city) => (
                            <SelectItem key={city.id} value={`${city.id}`}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
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
