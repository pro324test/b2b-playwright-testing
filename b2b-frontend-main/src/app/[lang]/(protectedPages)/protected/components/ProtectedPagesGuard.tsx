"use client";

import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import { useAppSelector } from "@/redux/config/hooks";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";
import toast from "react-hot-toast";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedPagesGuard({ children }: Props) {
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);

  const lang = useLang();
  useEffect(() => {
    if (!authEntity) {
      // toast("You have to be signed in first", {
      //   style: toastErrorStylesObject,
      // });
      redirect(routes.adminLogin.href({ lang }));
      return;
    }
    return () => {
      toast.dismiss();
    };
  }, [lang, authEntity]);

  if (!authEntity) return <></>;

  if (authEntity) return <>{children}</>;
}
