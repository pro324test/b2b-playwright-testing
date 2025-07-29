"use client";

import { useAppSelector } from "@/redux/config/hooks";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Product } from "@/types/ourApiSepecifc/Product";
import React, { useEffect } from "react";
import { productsRequests } from "@/requests/ourApi/productsRequests";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import SingleProductBox from "@/components/globals/products/SingleProductBox";
import CategoriesSection from "./CategoriesSection";
import StatsSection from "./StatsSection";
import BrandsSection from "./BrandsSection";
import SectionHead from "@/components/globals/SectionHead";
import WebsiteFeaturesSection from "./WebsiteFeaturesSection";
import SlidersSection from "./SlidersSection";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import { ContentManagement } from "@/types/ourApiSepecifc/ContentManagement";
import { contentManagementRequests } from "@/requests/ourApi/contentManagementRequests";
import ContentManagementSection from "@/components/globals/contentManagement/ContentManagementSection";
import Image from "next/image";
import { assetsConstants } from "@/constants/assetsConstants";
import StoresSection from "./StoresSection";

export default function HomePageContent() {
  const lang = useLang();
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [productsResponse, setProductsResponse] =
    React.useState<PaginatedResponse<Product> | null>(null);
  const [contentResponse, setContentResponse] =
    React.useState<PaginatedResponse<ContentManagement> | null>(null);

  useEffect(() => {
    async function getProducts() {
      try {
        const response = await productsRequests.getAll({});
        setProductsResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      }
    }
    async function getContent() {
      try {
        const response = await contentManagementRequests.getAll({});
        setContentResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      }
    }

    getProducts();
    getContent();
    // eslint-disable-next-line
  }, []);

  const displayedProducts =
    productsResponse == null
      ? []
      : [
          ...productsResponse.data,
          ...productsResponse.data,
          ...productsResponse.data,
        ];

  return (
    <>
      <div className="">
        <div className="flex justify-around gap-20 items-center padding-x">
          <Image
            src={assetsConstants.addToCartIllustration}
            alt="add to cart illustration"
            width={400}
            height={400}
            className="rotate-[5deg]"
          />
          <div>
            <h4 className="text-2xl font-bold mb-4">
              تسوق بسهولة مع تطبيق جملة
            </h4>
            <p className="text-gray-400 max-w-[400px]">
              تسوق بسهولة وراحة من أي مكان مع تطبيقنا لشراء السلع عبر الإنترنت.
              استمتع بتجربة تسوق سلسة،
            </p>
          </div>
        </div>
        <SlidersSection />

        {contentResponse?.data.length ? (
          <ContentManagementSection
            contentManagement={contentResponse.data[0]}
          />
        ) : (
          ""
        )}
        <div className="padding-x">
          <SectionHead
            label={dictionary.mostViewed}
            showMoreLink={routes.products.href({ lang })}
          />
          <div className="products-grid-container">
            {displayedProducts.map((product, index) => (
              <SingleProductBox key={product.id + index} product={product} />
            ))}
          </div>
        </div>
      </div>
      <CategoriesSection />
      <div className="padding-x">
        <SectionHead
          label={dictionary.specialForYou}
          showMoreLink={routes.products.href({ lang })}
        />
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-8 mt-4">
          {displayedProducts.map((product, index) => (
            <SingleProductBox key={product.id + index} product={product} />
          ))}
        </div>
      </div>
      <StatsSection />
      <div className="padding-x">
        <SectionHead
          label={dictionary.mostVisited}
          showMoreLink={routes.products.href({ lang })}
        />
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-8 mt-4">
          {displayedProducts.map((product, index) => (
            <SingleProductBox key={product.id + index} product={product} />
          ))}
        </div>
      </div>
      <StoresSection />
      <BrandsSection />
      <WebsiteFeaturesSection />
    </>
  );
}
