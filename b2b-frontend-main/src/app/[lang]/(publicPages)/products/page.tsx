import { getDictionary } from "@/localization/config/getDictionary";
import { Lang } from "@/types/global/Lang";
import { Metadata } from "next";
import React from "react";
import ProductsPageContentContainer from "./components/ProductsPageContentContainer";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;

  const dictionary = await getDictionary(lang as Lang);

  return {
    title: `${dictionary.products} | ${dictionary.slogan}`,
    description: `${dictionary.products} | ${dictionary.slogan}`,
  };
}
type Props = {
  params: Promise<{
    lang: string;
  }>;
  searchParams: Promise<DefaultQueryParams>;
};

export default async function Page({ searchParams }: Props) {
  const queryParams = await searchParams;
  return <ProductsPageContentContainer queryParams={queryParams} />;
}
