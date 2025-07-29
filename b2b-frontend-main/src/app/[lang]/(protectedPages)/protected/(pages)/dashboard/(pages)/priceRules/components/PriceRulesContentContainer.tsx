"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { priceRulesRequests } from "@/requests/ourApi/priceRulesRequests";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { PriceRule } from "@/types/ourApiSepecifc/PriceRule";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import PriceRuleSingleTableRow from "./PriceRuleSingleTableRow";
import CreatePriceRuleModal from "@/components/dashboard/priceRules/modals/CreatePriceRuleModal";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function PriceRulesContentContainer({ queryParams }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});
  const [isLoading, setIsLoading] = useState(true);
  const [response, setResponse] = useState<PaginatedResponse<PriceRule> | null>(
    null
  );
  const [isCreatePriceRuleModalOpen, setIsCreatePriceRuleModalOpen] =
    useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response =
          authEntity?.role == "admin" || authEntity?.role == "superadmin"
            ? await priceRulesRequests.getAll({
                privateAxios,
                queryParams,
              })
            : await priceRulesRequests.getMyPriceRules({
                privateAxios,
              });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <CreatePriceRuleModal
        isOpen={isCreatePriceRuleModalOpen}
        setIsOpen={setIsCreatePriceRuleModalOpen}
      />

      <div className="mb-4 flex justify-between items-center">
        <HeadingTitle label="Price Rules" />
        <button
          className={
            "py-2 px-6 bg-green-600 text-white flex gap-4 justify-center items-center"
          }
          onClick={() => setIsCreatePriceRuleModalOpen(true)}
        >
          Create Price Rule
        </button>
      </div>

      {isLoading ? (
        <LoadingInDashboard />
      ) : response == null || response.data.length == 0 ? (
        <NoDataFound />
      ) : (
        <div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>type</th>
                <th>value</th>
                <th>min quantity</th>
                <th>max quantity</th>
                <th>start date</th>
                <th>end date</th>
                <th>active</th>
                <th>actions</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((priceRule) => (
                <PriceRuleSingleTableRow
                  key={priceRule.id}
                  priceRule={priceRule}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
