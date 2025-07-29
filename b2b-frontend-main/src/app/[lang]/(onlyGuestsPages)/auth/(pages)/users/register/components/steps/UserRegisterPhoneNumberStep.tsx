"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppSelector } from "@/redux/config/hooks";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useCallback, useState } from "react";
import sharedStyles from "../../../../../styles/authSharedStyles.module.css";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import useLang from "@/hooks/useLang";
import Link from "next/link";
import { routes } from "@/constants/routesConstants";
import PasswordInput from "@/components/forms/inputs/PasswordInput";
import { RegisterPhoneNumberStepType } from "../types/RegisterPhoneNumberStepType";
import { usersRequests } from "@/requests/ourApi/usersRequests";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";

type Props = {
  setPhoneNumberForParent: React.Dispatch<React.SetStateAction<string>>;
  setRegisterStep: React.Dispatch<
    React.SetStateAction<RegisterPhoneNumberStepType>
  >;
};

export default function UserRegisterPhoneNumberStep({
  setPhoneNumberForParent,
  setRegisterStep,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const lang = useLang();

  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const submitHandler = useCallback(
    async ({
      theFirstName,
      theLastName,
      theUserName,
      theEmail,
      thePassword,
      thePhoneNumber,
    }: {
      theFirstName: string;
      theLastName: string;
      theUserName: string;
      theEmail: string;
      thePassword: string;
      thePhoneNumber: string;
    }) => {
      setIsLoading(true);
      try {
        const data: any = {
          firstName: theFirstName,
          lastName: theLastName,
          username: theUserName,
          phoneNumber: thePhoneNumber,
          password: thePassword,

          lang,
        };
        if (theEmail) {
          data.email = theEmail;
        }
        const response = await usersRequests.register(data);
        toastSuccessMessage({ dictionary, response });
        setPhoneNumberForParent(thePhoneNumber);
        setRegisterStep("otp");
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

  const canSubmit =
    firstName &&
    lastName &&
    userName &&
    phoneNumber.startsWith("218") &&
    phoneNumber.length == 12 &&
    password;
  return (
    <>
      <div className="min-h-[60vh] flex justify-center items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit || isLoading) return;
            submitHandler({
              theFirstName: firstName,
              theLastName: lastName,
              theUserName: userName,
              theEmail: email,
              thePhoneNumber: phoneNumber,
              thePassword: password,
            });
          }}
        >
          <div className={sharedStyles["container"]}>
            <h2 className="font-bold text-center mb-8">
              {dictionary.register}
            </h2>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="first-name">First Name</Label>
              <Input
                type="text"
                id="first-name"
                placeholder={"First Name"}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="mt-4 grid w-full items-center gap-1.5">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                type="text"
                id="last-name"
                placeholder={"Last Name"}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="mt-4 grid w-full items-center gap-1.5">
              <Label htmlFor="user-name">Username</Label>
              <Input
                type="text"
                id="user-name"
                placeholder={"Username"}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="mt-4 grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                placeholder={"name@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mt-4 grid w-full items-center gap-1.5">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                type="number"
                id="phone-number"
                placeholder={"2189XXXXXXXX"}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
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
              {isLoading ? <IphoneLoader /> : dictionary.register}
            </button>
            <div className="mt-4 flex justify-between items-center">
              <Link
                href={routes.userLogin.href({ lang })}
                className="main-link"
              >
                {dictionary.login}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
