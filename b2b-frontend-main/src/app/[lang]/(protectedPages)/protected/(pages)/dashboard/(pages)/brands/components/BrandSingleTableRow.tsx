"use client";

import { Brand } from "@/types/ourApiSepecifc/Brand";
import SingleBrandActionsDropdown from "./SingleBrandActionsDropdown";

type Props = {
  brand: Brand;
};

export default function BrandSingleTableRow({ brand }: Props) {
  return (
    <>
      <tr key={brand.id}>
        <td>{brand.id}</td>
        <td>{brand.name}</td>
        <td className="max-w-[25vw] cutted-text">{brand.description}</td>
        <td>
          <SingleBrandActionsDropdown brand={brand} />
        </td>
      </tr>
    </>
  );
}
