"use client";

import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import { Product } from "@/types/ourApiSepecifc/Product";
import Link from "next/link";
import React, { useCallback, useState } from "react";
import { productsRequests } from "@/requests/ourApi/productsRequests";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import ActivityToggler from "@/components/togglers/ActivityToggler";
import SingleProductActionsDropdown from "./SingleProductActionsDropdown";
import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";

type Props = {
  product: Product;
};

export default function ProductSingleTableRow({ product }: Props) {
  const lang = useLang();
  const privateAxios = usePrivateAxios({});
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [isActive, setIsActive] = useState(product.status == "enabled");
  const [isTogglingActivity, setIsTogglingActivity] = useState(false);

  const enableHandler = useCallback(async () => {
    setIsTogglingActivity(true);
    try {
      const response = await productsRequests.enable({
        privateAxios,
        productId: product.id,
      });
      setIsActive(true);
      toastSuccessMessage({ dictionary, response });
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsTogglingActivity(false);
    }
    // eslint-disable-next-line
  }, []);

  const disableHandler = useCallback(async () => {
    setIsTogglingActivity(true);
    try {
      const response = await productsRequests.disable({
        privateAxios,
        productId: product.id,
      });
      setIsActive(false);
      toastSuccessMessage({ dictionary, response });
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsTogglingActivity(false);
    }
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <LoadingWithOverlay isLoading={isTogglingActivity} />
      <tr key={product.id}>
        <td>
          <Link
            className="main-link"
            href={routes.dashboardSingleProduct.href({
              lang,
              id: product.id,
            })}
          >
            {product.id}
          </Link>
        </td>
        <td>{product.name}</td>
        <td>{product.inventory?.quantity || ""}</td>
        <td>
          <ActivityToggler
            isActive={isActive}
            disabled={isTogglingActivity}
            onToggle={() => {
              if (isTogglingActivity) return;
              if (isActive) {
                disableHandler();
              } else {
                enableHandler();
              }
            }}
          />
        </td>
        <td>
          <SingleProductActionsDropdown product={product} />
        </td>
      </tr>
    </>
  );
}
