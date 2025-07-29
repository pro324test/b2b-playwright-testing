"use client";

import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";
import ActivityToggler from "@/components/togglers/ActivityToggler";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import React, { useCallback, useState } from "react";
import SingleCityActionsDropdown from "./SingleCityActionsDropdown";
import { City } from "@/types/ourApiSepecifc/City";
import { citiesRequests } from "@/requests/ourApi/citiesRequests";

type Props = {
  city: City;
};

export default function CitySingleTableRow({ city }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});
  const [isActive, setIsActive] = useState(city.isActive);
  const [isLoading, setIsLoading] = useState(false);

  const activityTogglerIsDisabled =
    authEntity?.role != "superadmin" || isLoading;

  const handleDisable = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await citiesRequests.disable({
        privateAxios,
        id: city.id,
      });
      toastSuccessMessage({ dictionary, response });
      setIsActive(false);
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  const handleEnable = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await citiesRequests.enable({
        privateAxios,
        id: city.id,
      });
      toastSuccessMessage({ dictionary, response });
      setIsActive(true);
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <LoadingWithOverlay isLoading={isLoading} />
      <tr>
        <td>{city.id}</td>
        <td>{city.name}</td>
        <td>
          <ActivityToggler
            disabled={activityTogglerIsDisabled}
            onToggle={() => {
              if (activityTogglerIsDisabled) return;
              if (isActive) {
                handleDisable();
              } else {
                handleEnable();
              }
            }}
            isActive={isActive}
          />
        </td>
        {authEntity?.role == "superadmin" ? (
          <td>
            <SingleCityActionsDropdown city={city} />
          </td>
        ) : (
          ""
        )}
      </tr>
    </>
  );
}
