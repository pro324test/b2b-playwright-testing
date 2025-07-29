"use client";

import ActivityToggler from "@/components/togglers/ActivityToggler";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { categoriesRequests } from "@/requests/ourApi/categoriesRequests";
import { Category } from "@/types/ourApiSepecifc/Category";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import React, { useCallback, useState } from "react";
import Link from "next/link";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import SingleCategoryActionsDropdown from "./SingleCategoryActionsDropdown";
import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";

type Props = {
  category: Category;
};

export default function CategorySingleTableRow({ category }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});
  const lang = useLang();
  const [isActive, setIsActive] = useState(category.status == "enabled");
  const [isLoading, setIsLoading] = useState(false);
  const activityTogglerIsDisabled =
    (authEntity?.role != "superadmin" && authEntity?.role != "admin") ||
    isLoading;

  const handleDisable = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await categoriesRequests.disable({
        privateAxios,
        categoryId: category.id,
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
      const response = await categoriesRequests.enable({
        privateAxios,
        categoryId: category.id,
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
        <td>
          <Link
            className="main-link"
            href={routes.dashboardSingleCategoryById.href({
              lang,
              id: category.id,
            })}
          >
            {category.id}
          </Link>
        </td>
        <td>{category.name}</td>
        <td className="cutted-text max-w-[25vw]">
          {category.parent ? (
            <Link
              className="main-link"
              href={routes.dashboardSingleCategoryById.href({
                lang,
                id: category.parent?.id,
              })}
            >
              {category.parent?.name}
            </Link>
          ) : (
            ""
          )}
        </td>
        <td>
          <ActivityToggler
            isActive={isActive}
            disabled={activityTogglerIsDisabled}
            onToggle={() => {
              if (activityTogglerIsDisabled) return;
              if (isActive) handleDisable();
              else handleEnable();
            }}
          />
        </td>
        <td>
          <SingleCategoryActionsDropdown category={category} />
        </td>
      </tr>
    </>
  );
}
