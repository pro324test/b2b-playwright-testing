"use client";

import { Switch } from "@/components/ui/switch";
import React from "react";

type Props = {
  isActive: boolean;
  onToggle: () => void;
  disabled: boolean;
};

export default function ActivityToggler({
  isActive,
  onToggle,
  disabled,
}: Props) {
  return (
    <Switch
      disabled={disabled}
      checked={isActive}
      onCheckedChange={() => {
        onToggle();
      }}
    />
  );
}
