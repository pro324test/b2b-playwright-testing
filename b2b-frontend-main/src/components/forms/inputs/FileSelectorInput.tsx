"use client";

import Image from "next/image";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FaFileInvoice } from "react-icons/fa";

type Props = {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
};

export default function FileSelectorInput({ file, setFile }: Props) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
    // eslint-disable-next-line
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed #cccccc",
        borderRadius: "10px",
        padding: "20px",
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <input
        {...getInputProps()}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
          }
        }}
      />
      {file == null ? (
        <div className="flex flex-col items-center justify-center gap-2 text-lg font-bold text-gray-600">
          <span className="text-2xl">
            <FaFileInvoice />
          </span>
          {isDragActive ? (
            <>
              <span>أسحب الملف هنا</span>
              <span className="opacity-0">f</span>
              <span className="opacity-0">f</span>
            </>
          ) : (
            <>
              <span>اسحب الملف وأسقطه هنا</span>
              <span>أو</span>
              <span>استعراض الملفات</span>
            </>
          )}
        </div>
      ) : (
        <>
          <Image
            src={URL.createObjectURL(file)}
            alt="alternative"
            width={100}
            height={100}
          />
        </>
      )}
    </div>
  );
}
