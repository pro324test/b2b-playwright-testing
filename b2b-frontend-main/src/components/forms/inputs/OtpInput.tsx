import React, { useRef, useState } from "react";
import styles from "./styles/OtpInputStyles.module.css";

interface OtpInputProps {
  length?: number;
  onChange: (otp: string) => void;
  value?: string;
  inputType?: "text" | "number";
  autoFocus?: boolean;
  className?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onChange,
  value = "",
  inputType = "number",
  autoFocus = false,
  className = "",
}) => {
  const [internalValue, setInternalValue] = useState<string>(
    value.padEnd(length, "")
  );
  const otp = value.length === length ? value : internalValue;

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const val = e.target.value;
    if (!val) return;

    const newVal = val[val.length - 1];

    if (inputType === "number" && !/^[0-9]$/.test(newVal)) {
      return;
    }

    const otpArr = otp.split("");
    otpArr[idx] = newVal;
    const otpValue = otpArr.join("");

    setInternalValue(otpValue);
    onChange(otpValue);

    if (idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace") {
      if (!otp[idx] && idx > 0) {
        inputsRef.current[idx - 1]?.focus();
        const otpArr = otp.split("");
        otpArr[idx - 1] = "";
        setInternalValue(otpArr.join(""));
        onChange(otpArr.join(""));
        e.preventDefault();
      } else {
        const otpArr = otp.split("");
        otpArr[idx] = "";
        setInternalValue(otpArr.join(""));
        onChange(otpArr.join(""));
        e.preventDefault();
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, length);
    if (!pasted) return;
    const arr = pasted.split("");
    while (arr.length < length) arr.push("");
    setInternalValue(arr.join(""));
    onChange(arr.join(""));
    const lastIdx = arr.findIndex((v) => v === "");
    if (lastIdx === -1) {
      inputsRef.current[length - 1]?.focus();
    } else {
      inputsRef.current[lastIdx]?.focus();
    }
  };

  React.useEffect(() => {
    setInternalValue(value.padEnd(length, ""));
  }, [value, length]);

  return (
    <div className={` ${className} ${styles["container"]}`} dir="ltr">
      {Array.from({ length }).map((_, idx) => {
        const isFilled = !!otp[idx];
        // We'll check document.activeElement for active input
        const isActive =
          typeof window !== "undefined" &&
          document.activeElement === inputsRef.current[idx];
        return (
          <React.Fragment key={idx}>
            <input
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type={inputType}
              inputMode={inputType === "number" ? "numeric" : "text"}
              maxLength={1}
              value={otp[idx] || ""}
              autoFocus={autoFocus && idx === 0}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={handlePaste}
              className={`${className} ${isFilled ? styles.filled : ""} ${
                isActive ? styles.active : ""
              }`}
              onFocus={() => {
                // Force re-render to update isActive
                setInternalValue((v) => v);
              }}
              onBlur={() => {
                setInternalValue((v) => v);
              }}
            />
            {/* {idx < length - 1 && (
              <span className={styles.separator} aria-hidden="true">
                {" "}
                -{" "}
              </span>
            )} */}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default OtpInput;
