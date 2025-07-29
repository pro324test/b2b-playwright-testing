"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nextAuthIds } from "@/constants/nextAuthIds";
import { toastErrorStylesObject } from "@/constants/toastStylesObjectConstants";
import { useAppSelector } from "@/redux/config/hooks";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { signIn } from "next-auth/react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import sharedStyles from "../../../../styles/authSharedStyles.module.css";

import IphoneLoader from "@/components/loaders/IphoneLoader";
import Link from "next/link";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import PasswordInput from "@/components/forms/inputs/PasswordInput";

export default function UserLoginContent() {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const lang = useLang();
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const submitHandler = useCallback(
    async ({
      theIdentifier,
      thePassword,
    }: {
      theIdentifier: string;
      thePassword: string;
    }) => {
      setIsLoading(true);
      try {
        const response = await signIn(nextAuthIds.userLogin, {
          identifier: theIdentifier,
          password: thePassword,
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
  const canSubmit = identifier && password;
  return (
    <>
      <div className="min-h-[60vh] flex justify-center items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit || isLoading) return;
            submitHandler({ theIdentifier: identifier, thePassword: password });
          }}
        >
          <div className={sharedStyles["container"]}>
            <h2 className="font-bold text-center mb-8">{dictionary.login}</h2>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="identifier">Username Or Email</Label>
              <Input
                type="text"
                id="identifier"
                placeholder={"Username Or Email"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div className="mt-4 grid w-full items-center gap-1.5">
              <PasswordInput
                input={password}
                setInput={setPassword}
                label="Password"
                displayLabel
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
                href={routes.adminLogin.href({ lang })}
                className="main-link"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
