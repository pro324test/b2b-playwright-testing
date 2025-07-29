"use client";

import Image from "next/image";
import React, { forwardRef, memo, useImperativeHandle, useState } from "react";
import { Input } from "../ui/input";
import { ImageWithCaptionType } from "./types/ImageWithCaptionType";
import { ImageWithCaptionActionHandler } from "./actionHandlers/ImageWithCaptionActionHandler";
import styles from "./styles/ImageWithCaptionStyles.module.css";
import { IoClose } from "react-icons/io5";

type Props = {
  imageWithCaption: ImageWithCaptionType;
  onXClick: (id: number) => void;
};

const ImageWithCaption = forwardRef<ImageWithCaptionActionHandler, Props>(
  ({ imageWithCaption, onXClick }: Props, ref) => {
    const [caption, setCaption] = useState(imageWithCaption.caption);

    useImperativeHandle(ref, () => ({
      triggerAction: () => {
        return {
          ...imageWithCaption,
          caption: caption,
        };
      },
    }));

    return (
      <div className={styles["container"]}>
        <button
          className={styles["x-button"]}
          onClick={() => {
            onXClick(imageWithCaption.id);
          }}
        >
          <IoClose />
        </button>
        <Image
          src={URL.createObjectURL(imageWithCaption.file)}
          alt={imageWithCaption.caption}
          width={200}
          height={200}
        />
        <Input
          type="text"
          placeholder="Caption"
          value={caption}
          onChange={(e) => {
            setCaption(e.target.value);
          }}
        />
      </div>
    );
  }
);

ImageWithCaption.displayName = "ImageWithCaption";
export default memo(ImageWithCaption);
