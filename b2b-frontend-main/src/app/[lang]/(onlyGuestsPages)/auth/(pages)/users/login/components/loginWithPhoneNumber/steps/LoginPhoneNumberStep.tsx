"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppSelector } from "@/redux/config/hooks";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { useCallback, useState } from "react";
import sharedStyles from "../../../../../../styles/authSharedStyles.module.css";

import IphoneLoader from "@/components/loaders/IphoneLoader";
import Link from "next/link";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import { usersRequests } from "@/requests/ourApi/usersRequests";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { LoginPhoneNumberStepType } from "../types/LoginPhoneNumberStepType";

type Props = {
  setPhoneNumberOfParent: React.Dispatch<React.SetStateAction<string>>;
  setLoginStep: React.Dispatch<React.SetStateAction<LoginPhoneNumberStepType>>;
};

export default function LoginPhoneNumberStep({
  setPhoneNumberOfParent,
  setLoginStep,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const lang = useLang();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const submitHandler = useCallback(
    async ({ thePhoneNumber }: { thePhoneNumber: string }) => {
      setIsLoading(true);
      try {
        const response = await usersRequests.requestLoginOtp({
          phoneNumber: thePhoneNumber,
          lang,
        });
        toastSuccessMessage({ dictionary, response });
        setPhoneNumberOfParent(thePhoneNumber);
        setLoginStep("otp");
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
  const canSubmit = phoneNumber.startsWith("218") && phoneNumber.length === 12;
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit || isLoading) return;
          submitHandler({ thePhoneNumber: phoneNumber });
        }}
      >
        <div className={sharedStyles["container"]}>
          <h2 className="font-bold text-center mb-8">{dictionary.login}</h2>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="phone-number">{dictionary.phoneNumber}</Label>
            <Input
              type="number"
              id="phone-number"
              placeholder={"2189XXXXXXXX"}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
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
