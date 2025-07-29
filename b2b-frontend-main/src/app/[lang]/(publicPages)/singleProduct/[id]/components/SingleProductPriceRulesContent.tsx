"use client";

import { useAppSelector } from "@/redux/config/hooks";
import { PriceRule } from "@/types/ourApiSepecifc/PriceRule";
import React from "react";
import styles from "./styles/SingleProductPriceRulesContentStyles.module.css";

type Props = {
  priceRules: PriceRule[];
};

export default function SingleProductPriceRulesContent({ priceRules }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const values = [
    {
      label: `${dictionary.from} 1 - 99 ${dictionary.piece}`,
      value: `1300 ${dictionary.LYD}`,
    },
    {
      label: `${dictionary.from} 100 - 499 ${dictionary.piece}`,
      value: `1000 ${dictionary.LYD}`,
    },
    {
      label: `${dictionary.from} 500 - 999 ${dictionary.piece}`,
      value: `900 ${dictionary.LYD}`,
    },
  ];
  if (priceRules.length === 0) {
  }
  return (
    <div className={styles["container"]}>
      <p className={styles["quantity"]}>
        {dictionary.quantity} ({dictionary.piecesCount})
      </p>
      <p className={styles["price"]}>{dictionary.price}</p>
      <div className={styles["values-container"]}>
        {values.map((value) => (
          <div key={value.label} className={styles["single-value"]}>
            <span>{value.label}</span>
            <span>{value.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
