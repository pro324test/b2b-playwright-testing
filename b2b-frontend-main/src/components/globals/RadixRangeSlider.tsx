"use client";

import React from "react";
import { Slider } from "radix-ui";
import useWebsiteDirection from "@/hooks/useWebsiteDirection";
import styles from "./styles/RadixRangeSliderStyles.module.css";

type Props = {
  min: number;
  max: number;
  values: [number, number];
  onValueChange: (value: number[]) => void;
};

export default function RadixRangeSlider({
  min,
  max,
  values,
  onValueChange,
}: Props) {
  const websiteDirection = useWebsiteDirection();
  return (
    <Slider.Root
      className={styles["root"]}
      value={values}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={1}
      dir={websiteDirection}
    >
      <Slider.Track className={styles["track"]}>
        <Slider.Range className={styles["range"]} />
      </Slider.Track>
      <Slider.Thumb className={styles["thumb"]} aria-label="Lower Bound" />
      <Slider.Thumb className={styles["thumb"]} aria-label="Upper Bound" />
    </Slider.Root>
  );
}
