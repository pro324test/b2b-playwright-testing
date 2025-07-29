"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { citiesRequests } from "@/requests/ourApi/citiesRequests";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { City } from "@/types/ourApiSepecifc/City";
import { shopAddressesRequests } from "@/requests/ourApi/shopAddressesRequest";
import IphoneLoader from "@/components/loaders/IphoneLoader";

type Props = {
  shopId: number;
};

export default function CreateShopAddressButtonWithDialog({ shopId }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const websiteDirection = useWebsiteDirection();
  const router = useRouter();
  const [street, setStreet] = useState("");
  const [notes, setNotes] = useState("");
  const [isGettingCities, setIsGettingCities] = useState(false);
  const [citiesResponse, setCitiesResponse] =
    useState<PaginatedResponse<City> | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = street != "" && cityId != null;

  const handleSubmit = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await shopAddressesRequests.createAddress({
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
    <Dialog>
      <DialogTrigger
        className={
          "py-2 px-6 bg-green-600 text-white flex gap-4 justify-center items-center"
        }
      >
        <FaRegPlusSquare />

        <span> Create Address</span>
      </DialogTrigger>
      <DialogContent className="min-w-[50%]" dir={websiteDirection}>
        <DialogHeader>
          <DialogTitle className="text-3xl text-center">
            Create Shop Address
          </DialogTitle>
          <div>
            <div className="mt-12 mb-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading || !canSubmit) return;
                  const data = {
                    street,
                    notes,
                    cityId,
                    shopId,
                  };
                  handleSubmit(data);
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
