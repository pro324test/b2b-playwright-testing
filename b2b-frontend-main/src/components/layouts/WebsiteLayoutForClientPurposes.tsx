"use client";
import { useEffect, useState } from "react";
import { Dictionary } from "@/types/global/Dictionary";
import { useAppDispatch } from "@/redux/config/hooks";
import { updateDictionary } from "@/redux/features/dictionary/dictionarySlice";
import { Toaster } from "react-hot-toast";
import WebsiteIsLoading from "../loaders/WebsiteIsLoading";
import useWebsiteDirection from "@/hooks/useWebsiteDirection";

type Props = {
  children: React.ReactNode;
  dictionary: Dictionary;
};

export default function WebsiteLayoutForClientPurposes({
  children,
  dictionary,
}: Props) {
  const dispatch = useAppDispatch();
  const websiteDirection = useWebsiteDirection();
  const [websiteIsLoading, setWebsiteIsLoading] = useState(true);

  // use effect for dispatching the dictionary
  useEffect(() => {
    dispatch(updateDictionary(dictionary));
  }, [dictionary, dispatch]);

  // use effect for loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setWebsiteIsLoading(false);
    }, 200);

    return function cleanup() {
      clearTimeout(timer);
    };
  }, []);

  if (websiteIsLoading) return <WebsiteIsLoading />;

  return (
    <>
      {children}
      <Toaster
        position={websiteDirection == "ltr" ? "bottom-left" : "bottom-right"}
        // position="bottom-right"
      />
    </>
  );
}
