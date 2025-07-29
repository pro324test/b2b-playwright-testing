"use client";

import { Label } from "@/components/ui/label";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { useCallback, useState } from "react";
import sharedStyles from "../../../../../styles/authSharedStyles.module.css";

import IphoneLoader from "@/components/loaders/IphoneLoader";
import useLang from "@/hooks/useLang";
import Link from "next/link";
import { routes } from "@/constants/routesConstants";
import { usersRequests } from "@/requests/ourApi/usersRequests";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { useRouter } from "nextjs-toploader/app";
import PasswordInput from "@/components/forms/inputs/PasswordInput";
import { useAppSelector } from "@/redux/config/hooks";
import OtpInput from "@/components/forms/inputs/OtpInput";

type Props = {
  phoneNumber: string;
};

export default function UserResetPasswordStep({ phoneNumber }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const lang = useLang();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const submitHandler = useCallback(
    async ({
      thePhoneNumber,
      theOtp,
      theNewPassword,
    }: {
      thePhoneNumber: string;
      theOtp: string;
      theNewPassword: string;
    }) => {
      setIsLoading(true);
      try {
        const response = await usersRequests.resetPassword({
          otp: theOtp,
          phoneNumber: thePhoneNumber,
          newPassword: theNewPassword,
          lang,
        });
        toastSuccessMessage({ dictionary, response });
        router.replace(routes.userLogin.href({ lang }));
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
  const canSubmit = otp.length === 6 && newPassword !== "";
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit || isLoading) return;
          submitHandler({
            thePhoneNumber: phoneNumber,
            theOtp: otp,
            theNewPassword: newPassword,
          });
        }}
      >
        <div className={sharedStyles["container"]}>
          <h2 className="font-bold text-center mb-8">
            {dictionary.resetPassword}
          </h2>

          <div className="grid w-full items-center gap-1.5 mb-8">
            <Label htmlFor="otp">{dictionary.otp}</Label>
            <OtpInput length={6} value={otp} onChange={setOtp} />
          </div>
          <div className="grid w-full items-center gap-1.5 mt-4">
            <PasswordInput
              input={newPassword}
              setInput={setNewPassword}
              label={dictionary.newPassword}
              displayLabel
            />
          </div>

          <button disabled={!canSubmit || isLoading}>
            {isLoading ? <IphoneLoader /> : dictionary.resetPassword}
          </button>
          <div className="mt-4 flex justify-between items-center">
            <Link
              href={routes.userRegister.href({ lang })}
              className="main-link"
            >
              {dictionary.register}
            </Link>
          </div>
        </div>
      </form>
    </>
  );
}
