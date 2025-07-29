import React from "react";

type Props = {
  classNames?: string;
};

export default function Divider({ classNames }: Props) {
  return (
    <div
      className={`h-0.5 bg-zinc-200 w-full dark:bg-zinc-900 ${
        classNames || ""
      }`}
    ></div>
  );
}
