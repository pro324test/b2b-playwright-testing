"use client";

import { useState } from "react";
import { ForgotPasswordStepType } from "./types/ForgotPasswordStepType";
import UserForgotPasswordStep from "./steps/UserFogotPasswordStep";
import UserResetPasswordStep from "./steps/UserResetPasswordStep";

export default function UserForgotPasswordContent() {
  const [step, setStep] = useState<ForgotPasswordStepType>("phoneNumber");
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <>
      <div className="min-h-[60vh] flex justify-center items-center">
        {step === "phoneNumber" ? (
          <UserForgotPasswordStep
            setPhoneNumberOfParent={setPhoneNumber}
            setLoginStep={setStep}
          />
        ) : step == "otpAndNewpassword" ? (
          <UserResetPasswordStep phoneNumber={phoneNumber} />
        ) : null}
      </div>
    </>
  );
}
