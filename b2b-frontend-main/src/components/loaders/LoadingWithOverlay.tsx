"use client";

import React, { useEffect } from "react";

import styles from "./styles/LoadingWithOverlayStyles.module.css";
import { createPortal } from "react-dom";
import RingEffect from "./RingEffect";
// import { MutatingDots, RotatingLines } from "react-loader-spinner";

type Props = {
  isLoading: boolean;
};

export default function LoadingWithOverlay({ isLoading }: Props) {
  useEffect(() => {
    if (isLoading) {
      document.documentElement.classList.add("overflow-hidden");
    } else {
      document.documentElement.classList.remove("overflow-hidden");
    }
  }, [isLoading]);
  const theContent = (
    <>
      {isLoading && (
        <div className={styles["loading-container"]}>
          {/* <MutatingDots
        height="100"
        width="100"
        color="green"
        secondaryColor="#4fa94d"
        radius="12.5"
        ariaLabel="mutating-dots-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      /> */}
          {/* <LoaderSpinner /> */}
          <RingEffect />
        </div>
      )}
    </>
  );
  return createPortal(theContent, document.body);
}
