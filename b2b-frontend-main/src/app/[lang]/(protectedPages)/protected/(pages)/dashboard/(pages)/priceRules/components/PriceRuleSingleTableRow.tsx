"use client";

import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";
import ActivityToggler from "@/components/togglers/ActivityToggler";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { priceRulesRequests } from "@/requests/ourApi/priceRulesRequests";
import { PriceRule } from "@/types/ourApiSepecifc/PriceRule";
import { extractDateAndTime } from "@/utils/extractDateAndTime";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import React, { useCallback, useRef, useState } from "react";
import SinglePriceRuleActionsDropdown from "./SinglePriceRuleActionsDropdown";

type Props = {
  priceRule: PriceRule;
};

export default function PriceRuleSingleTableRow({ priceRule }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [isActive, setIsActive] = useState(priceRule.status == "enabled");
  const [isLoading, setIsLoading] = useState(false);
  const startDate = useRef(
    priceRule.startDate ? extractDateAndTime(priceRule.startDate) : null
  );
  const endDate = useRef(
    priceRule.endDate ? extractDateAndTime(priceRule.endDate) : null
  );

  const handleDisable = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await priceRulesRequests.disable({
        privateAxios,
        id: priceRule.id,
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
      const response = await priceRulesRequests.enable({
        privateAxios,
        id: priceRule.id,
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
        <td>{priceRule.id}</td>
        <td>{priceRule.name}</td>
        <td>{priceRule.type}</td>
        <td>{priceRule.value}</td>
        <td>{priceRule.minQuantity}</td>
        <td>{priceRule.maxQuantity}</td>
        <td>
          {startDate.current
            ? `${startDate.current.date} ${startDate.current.time}`
            : ""}
        </td>
        <td>
          {endDate.current
            ? `${endDate.current.date} ${endDate.current.time}`
            : ""}
        </td>
        <td>
          <ActivityToggler
            isActive={isActive}
            disabled={isLoading}
            onToggle={() => {
              if (isLoading) return;
              if (isActive) {
                handleDisable();
              } else {
                handleEnable();
              }
            }}
          />
        </td>
        <td>
          <SinglePriceRuleActionsDropdown priceRule={priceRule} />
        </td>
      </tr>
    </>
  );
}
