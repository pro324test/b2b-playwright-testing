"use client";

import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";
import ActivityToggler from "@/components/togglers/ActivityToggler";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";

import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import React, { useCallback, useState } from "react";
import SingleAttributeActionsDropdown from "./SingleAttributeActionsDropdown";
import { Attribute } from "@/types/ourApiSepecifc/Attribute";
import { attributesRequests } from "@/requests/ourApi/attributesRequests";
import Link from "next/link";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";

type Props = {
  attribute: Attribute;
  disableIdLink?: boolean;
};

export default function AttributeSingleTableRow({
  attribute,
  disableIdLink,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const lang = useLang();
  const privateAxios = usePrivateAxios({});
  const [isActive, setIsActive] = useState(attribute.isEnabled);
  const [isLoading, setIsLoading] = useState(false);

  const activityTogglerIsDisabled =
    (authEntity?.role != "superadmin" && authEntity?.role == "admin") ||
    isLoading;

  const handleDisable = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await attributesRequests.disable({
        privateAxios,
        id: attribute.id,
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
      const response = await attributesRequests.enable({
        privateAxios,
        id: attribute.id,
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
      <tr key={attribute.id}>
        <td>
          {disableIdLink ? (
            attribute.id
          ) : (
            <Link
              href={routes.dashboardSingleAttributeById.href({
                lang,
                id: attribute.id,
              })}
              className="main-link"
            >
              {attribute.id}
            </Link>
          )}
        </td>
        <td>{attribute.name}</td>
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
        <td>
          <SingleAttributeActionsDropdown attribute={attribute} />
        </td>
      </tr>
    </>
  );
}
