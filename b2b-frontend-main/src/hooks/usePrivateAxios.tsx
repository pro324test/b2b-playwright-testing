"use client";

import {
  ourApiAxios,
  ourApiAxiosMultipartFormData,
} from "@/constants/ourApiConstants";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import useLang from "./useLang";
import { toastErrorStylesObject } from "@/constants/toastStylesObjectConstants";

type Props = {
  contentType?: string;
  // from?: string;
};

export default function usePrivateAxios({ contentType }: Props) {
  const lang = useLang();
  const dispatch = useAppDispatch();
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const axiosInstanceToIntercept =
    contentType == "multipart/form-data"
      ? ourApiAxiosMultipartFormData
      : ourApiAxios;

  useEffect(() => {
    const requestIntercept = axiosInstanceToIntercept.interceptors.request.use(
      (config) => {
        config.headers["lang"] = lang;
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${authEntity?.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept =
      axiosInstanceToIntercept.interceptors.response.use(
        (response) => response,
        async (error) => {
          if (error?.response?.status === 401) {
            toast("You have to be signed in first", {
              style: toastErrorStylesObject,
            });
            dispatch(logout());
            signOut();
          }
          return Promise.reject(error);
        }
      );

    return () => {
      ourApiAxios.interceptors.request.eject(requestIntercept);
      ourApiAxios.interceptors.response.eject(responseIntercept);
    };
    // eslint-disable-next-line
  }, [authEntity]);
  return axiosInstanceToIntercept;
}
