"use client";

import ShowImagesButtonWithDialog from "@/components/dialogs/ShowImagesButtonWithDialog";
import { Input } from "@/components/ui/input";
import React from "react";

type Props = {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
};

export default function FileInputWithView({ file, setFile }: Props) {
  return (
    <>
      <div className="flex items-center gap-4">
        <Input
          type="file"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
              setFile(selectedFile);
            }
          }}
        />
        {file ? (
          <ShowImagesButtonWithDialog images={[URL.createObjectURL(file)]} />
        ) : (
          ""
        )}
      </div>
    </>
  );
}
