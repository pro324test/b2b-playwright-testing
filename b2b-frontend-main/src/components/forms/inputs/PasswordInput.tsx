"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useRef, useState } from "react";
import { FaRegEyeSlash } from "react-icons/fa";
import { IoIosEye } from "react-icons/io";

type Props = {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  label: string;
  displayLabel: boolean;
};

export default function PasswordInput({
  input,
  setInput,
  label,
  displayLabel,
}: Props) {
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const key = useRef(Math.random());
  return (
    <div className="grid w-full items-center gap-1.5">
      {displayLabel ? (
        <Label htmlFor={key.current.toString()}>{label}</Label>
      ) : (
        ""
      )}
      <div className="relative">
        <Input
          type={passwordIsVisible ? "text" : "password"}
          id={key.current.toString()}
          placeholder="XXXXXXXX"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="button"
          className="text-2xl absolute top-[50%] ltr:right-[10px] rtl:left-[10px] transform -translate-y-1/2"
          onClick={() => setPasswordIsVisible((prevState) => !prevState)}
        >
          {passwordIsVisible ? <IoIosEye /> : <FaRegEyeSlash />}
        </button>
      </div>
    </div>
  );
}
