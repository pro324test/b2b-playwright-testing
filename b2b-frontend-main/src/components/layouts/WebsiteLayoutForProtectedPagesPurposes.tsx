"use client";

import { useAppDispatch } from "@/redux/config/hooks";
import { signOut, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import WebsiteIsLoading from "../loaders/WebsiteIsLoading";
import { login, logout } from "@/redux/features/auth/authSlice";
import { AuthEntity } from "@/types/global/AuthEntity";
import { authRequests } from "@/requests/ourApi/authRequests";
import { redirect, usePathname } from "next/navigation";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";

type Props = {
  children: React.ReactNode;
};

export default function WebsiteLayoutForProtectedPagesPurposes({
  children,
}: Props) {
  const lang = useLang();
  const session = useSession();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const isAuthenticated = session.status == "authenticated";
  const isNotAuthenticated = session.status == "unauthenticated";
  const [processFinished, setProcessFinished] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const accessToken = session.data.user.accessToken;
      const getMyData = async () => {
        try {
          const response: AxiosResponse<AuthEntity> = await authRequests.getMe(
            accessToken
          );
          const userData = response.data;
          dispatch(login({ ...userData, accessToken }));
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          dispatch(logout());
          signOut();
        } finally {
          setProcessFinished(true);
        }
      };
      getMyData();
    } else if (session.status == "unauthenticated") {
      if (pathname.startsWith(routes.protected.href({ lang }))) {
        redirect(routes.userLogin.href({ lang }));

        return;
      }
      setProcessFinished(true);
    }
    // eslint-disable-next-line
  }, [
    isAuthenticated,
    isNotAuthenticated,
    dispatch,
    session.data?.user?.accessToken,
  ]);

  // should do something here

  if (!processFinished) {
    return <WebsiteIsLoading />;
  }

  return <>{children}</>;
}
