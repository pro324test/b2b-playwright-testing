import SectionHead from "@/components/globals/SectionHead";
import { getDictionary } from "@/localization/config/getDictionary";
import { Lang } from "@/types/global/Lang";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  params: Promise<{
    lang: Lang;
  }>;
};

export default async function Page({ params }: Props) {
  const { lang } = await params;

  const dictionary = await getDictionary(lang);
  return (
    <div className="padding-x mb-8">
      <SectionHead label={dictionary.stores} />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
          (item, index) => {
            return (
              <Link
                key={item + index}
                href={"#"}
                className="bg-gray-100 p-4 flex items-center justify-center"
              >
                <Image
                  src={`/assets/images/stores/store-${item}.png`}
                  alt="store"
                  width={200}
                  height={200}
                  className="object-cover"
                />
              </Link>
            );
          }
        )}
      </div>
    </div>
  );
}
