import React from "react";
import styles from "./styles/ImageInFormStyles.module.css";
import { IoClose } from "react-icons/io5";
import Image from "next/image";

type Props = {
  id: number;
  file: File;
  onXClick: (id: number) => void;
};

export default function ImageInForm({ id, file, onXClick }: Props) {
  return (
    <div className={styles["container"]}>
      <button
        className={styles["x-button"]}
        onClick={() => {
          onXClick(id);
        }}
      >
        <IoClose />
      </button>
      <Image
        src={URL.createObjectURL(file)}
        alt={"placeholder"}
        width={200}
        height={200}
      />
    </div>
  );
}
