"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const NProgressProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <ProgressBar
        height="4px"
        color="#f00"
        options={{ showSpinner: true }}
        shallowRouting
      />
    </>
  );
};

export default NProgressProvider;
