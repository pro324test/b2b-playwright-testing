import React, { ReactNode } from "react";

type Props = {
  label: string;
  postLabel?: ReactNode;
};

export default function HeadingTitle({ label, postLabel }: Props) {
  return (
    <h2 className="text-3xl font-bold">
      {label} {postLabel || ""}
    </h2>
  );
}
