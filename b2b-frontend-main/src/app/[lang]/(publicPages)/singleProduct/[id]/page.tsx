import NoDataFound from "@/components/globals/NoDataFound";
import { getDictionary } from "@/localization/config/getDictionary";
import { productsRequests } from "@/requests/ourApi/productsRequests";
import { Lang } from "@/types/global/Lang";
import { Product } from "@/types/ourApiSepecifc/Product";

import { Metadata } from "next";
import React from "react";
import SingleProductPageContentContainer from "./components/SingleProductPageContentContainer";

type Props = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  const dictionary = await getDictionary(lang as Lang);
  const noDataFoundObject = {
    title: `${dictionary.pageNotFound} | ${dictionary.slogan}`,
    description: `${dictionary.pageNotFound} | ${dictionary.slogan}`,
  };
  try {
    const product = await getProductData(id);
    return {
      title: `${product.name} | ${dictionary.slogan}`,
      description: `${product.description} | ${dictionary.slogan}`,
    };
  } catch {
    return noDataFoundObject;
  }
}

async function getProductData(id: string): Promise<Product> {
  const productId = Number(id);
  if (isNaN(productId)) {
    throw new Error("Invalid product ID");
  }
  try {
    const response = await productsRequests.fetchById(productId);
    const data = (await response.json()) as Product;
    return data;
  } catch (error) {
    throw error;
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  let product: Product | null = null;
  try {
    product = await getProductData(id);
  } catch {
    // console.error("Error fetching product data:", error);
  }
  if (!product) {
    return <NoDataFound />;
  }
  return <SingleProductPageContentContainer product={product} />;
}
