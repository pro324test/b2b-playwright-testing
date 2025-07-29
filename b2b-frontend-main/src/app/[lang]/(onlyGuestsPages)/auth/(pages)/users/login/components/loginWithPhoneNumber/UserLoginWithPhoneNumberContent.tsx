"use client";

import { useState } from "react";

import { LoginPhoneNumberStepType } from "./types/LoginPhoneNumberStepType";
import LoginPhoneNumberStep from "./steps/LoginPhoneNumberStep";
import LoginOtpStep from "./steps/LoginOtpStep";

export default function UserLoginWithPhoneNumberContent() {
  const [step, setStep] = useState<LoginPhoneNumberStepType>("phoneNumber");
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <>
      <div className="min-h-[60vh] flex justify-center items-center">
        {step === "phoneNumber" ? (
          <LoginPhoneNumberStep
            setPhoneNumberOfParent={setPhoneNumber}
            setLoginStep={setStep}
          />
        ) : step == "otp" ? (
          <LoginOtpStep phoneNumber={phoneNumber} />
        ) : null}
      </div>
    </>
  );
}
