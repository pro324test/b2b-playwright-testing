"use client";

import { Product } from "@/types/ourApiSepecifc/Product";
import React, { useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/redux/config/hooks";
import SingleProductShopTabContent from "./tabs/SingleProductShopTabContent";
import SingleProductReviewsContent from "./tabs/SingleProductReviewsContent";
import useWebsiteDirection from "@/hooks/useWebsiteDirection";
import styles from "./styles/SingleProductTabsContentContainerStyles.module.css";

type Props = {
  product: Product;
};

export default function SingleProductTabsContentContainer({ product }: Props) {
  const websiteDirection = useWebsiteDirection();
  const { pageKey } = useAppSelector((state) => state.otherSlice);
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const tabs = useRef([
    {
      value: "shop",
      label: dictionary.shop,
    },
    {
      value: "description",
      label: dictionary.description,
    },
    {
      value: "reviews",
      label: dictionary.reviews,
    },
  ]);
  return (
    <div className="mt-12">
      <Tabs defaultValue={tabs.current[0].value} dir={websiteDirection}>
        <TabsList className={`padding-x ${styles["tabs-list"]}`}>
          {tabs.current.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className=" padding-x pb-8 pt-4  bg-[#F3F3F3]" key={pageKey}>
          <SingleProductShopTabContent tabValue="shop" product={product} />

          <TabsContent value="description">{product.description}</TabsContent>

          <SingleProductReviewsContent
            tabValue="reviews"
            productId={product.id}
          />
        </div>
      </Tabs>
    </div>
  );
}
