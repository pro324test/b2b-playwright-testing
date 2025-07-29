"use client";

import { ourApiAxios } from "@/constants/ourApiConstants";
import { useEffect } from "react";
import useLang from "./useLang";

export default function usePublicAxios() {
  const lang = useLang();

  useEffect(() => {
    const requestIntercept = ourApiAxios.interceptors.request.use(
      (config) => {
        config.headers["Accept"] = "application/json";
        config.headers["Content-Type"] = "application/json";
        config.headers["lang"] = lang;
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      ourApiAxios.interceptors.request.eject(requestIntercept);
    };
    // eslint-disable-next-line
  }, []);
  return ourApiAxios;
}
