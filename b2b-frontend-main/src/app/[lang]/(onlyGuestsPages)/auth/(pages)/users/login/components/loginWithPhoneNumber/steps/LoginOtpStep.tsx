"use client";

import { nextAuthIds } from "@/constants/nextAuthIds";
import { toastErrorStylesObject } from "@/constants/toastStylesObjectConstants";
import { useAppSelector } from "@/redux/config/hooks";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { signIn } from "next-auth/react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import sharedStyles from "../../../../../../styles/authSharedStyles.module.css";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import useLang from "@/hooks/useLang";
import Link from "next/link";
import { routes } from "@/constants/routesConstants";

import OtpInput from "@/components/forms/inputs/OtpInput";

type Props = {
  phoneNumber: string;
};

export default function LoginOtpStep({ phoneNumber }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const lang = useLang();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const submitHandler = useCallback(
    async ({
      thePhoneNumber,
      theOtp,
    }: {
      thePhoneNumber: string;
      theOtp: string;
    }) => {
      setIsLoading(true);
      try {
        const response = await signIn(nextAuthIds.userLoginWithOtp, {
          phoneNumber: thePhoneNumber,
          otp: theOtp,

          redirect: false,
        });
        if (response?.error) {
          const errorMessage = response?.error || dictionary.somethingWentWrong;
          toast(errorMessage, {
            style: toastErrorStylesObject,
            position: "bottom-left",
          });
          return;
        }
      } catch (error) {
        extractErrorAndToastIt({
          error,
          dictionary,
        });
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line
    []
  );
  const canSubmit = otp.length === 6;
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit || isLoading) return;
          submitHandler({ thePhoneNumber: phoneNumber, theOtp: otp });
        }}
      >
        <div className={sharedStyles["container"]}>
          <h2 className="text-2xl font-bold text-center mb-4">
            {dictionary.verifyViaOtp}
          </h2>

          <h4 className="text-center mb-8 text-gray-500">
            {dictionary.enterOtpSentToYourPhone} {phoneNumber}
          </h4>

          <div className="grid w-full items-center gap-1.5">
            <OtpInput length={6} value={otp} onChange={setOtp} />
          </div>

          <button disabled={!canSubmit || isLoading}>
            {isLoading ? <IphoneLoader /> : dictionary.login}
          </button>
          <div className="mt-4 flex justify-between items-center">
            <Link
              href={routes.userRegister.href({ lang })}
              className="main-link"
            >
              {dictionary.register}
            </Link>
            <Link
              href={routes.forgotPassword.href({ lang })}
              className="main-link"
            >
              {dictionary.forgotPassword}
            </Link>
          </div>
        </div>
      </form>
    </>
  );
}
