"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import { useAppSelector } from "@/redux/config/hooks";
import { Product } from "@/types/ourApiSepecifc/Product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditProductTabContent from "./tabs/EditProductTabContent";
import EditProductVariantsTabContent from "./tabs/EditProductVariantsTabContent";
import ActivityToggler from "@/components/togglers/ActivityToggler";
import { useCallback, useState } from "react";
import { productsRequests } from "@/requests/ourApi/productsRequests";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import IphoneLoader from "@/components/loaders/IphoneLoader";

type Props = {
  product: Product;
};

export default function EditProductContentContainer({ product }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});
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

  if (product == null) return <NoDataFound />;

  if (product.shop?.vendor?.id != authEntity?.vendor?.id) {
    return <p>You Are Not Authorized to reach this page</p>;
  }

  return (
    <>
      <div className="mb-4">
        <HeadingTitle
          label={`Edit Product`}
          postLabel={<span className="text-main-color">{product.name}</span>}
        />
      </div>
      <div>
        <Tabs defaultValue="details">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
            </TabsList>
            <div className="flex gap-2 items-center">
              {isTogglingActivity ? (
                <IphoneLoader additionalClassNames="!w-[20px] !h-[20px]" />
              ) : (
                ""
              )}
              <p className="font-bold">Active </p>
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
            </div>
          </div>
          <TabsContent value="details">
            <EditProductTabContent product={product} />
          </TabsContent>
          <TabsContent value="variants">
            <EditProductVariantsTabContent product={product} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
