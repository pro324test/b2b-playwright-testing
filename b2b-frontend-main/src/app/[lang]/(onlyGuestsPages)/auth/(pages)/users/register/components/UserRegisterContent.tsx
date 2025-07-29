"use client";

import { useState } from "react";

import { RegisterPhoneNumberStepType } from "./types/RegisterPhoneNumberStepType";
import UserRegisterPhoneNumberStep from "./steps/UserRegisterPhoneNumberStep";
import UserRegisterOtpStep from "./steps/UserRegisterOtpStep";

export default function UserRegisterContent() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<RegisterPhoneNumberStepType>("phoneNumber");

  return (
    <>
      <div className="min-h-[60vh] flex justify-center items-center">
        {step === "phoneNumber" ? (
          <UserRegisterPhoneNumberStep
            setPhoneNumberForParent={setPhoneNumber}
            setRegisterStep={setStep}
          />
        ) : step === "otp" ? (
          <UserRegisterOtpStep phoneNumber={phoneNumber} />
        ) : null}
      </div>
    </>
  );
}
