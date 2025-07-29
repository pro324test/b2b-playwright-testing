"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useWebsiteDirection from "@/hooks/useWebsiteDirection";
import Image from "next/image";

type Props = {
  images: string[];
};

export default function ShowImagesButtonWithDialog({ images }: Props) {
  const websiteDirection = useWebsiteDirection();
  return (
    <>
      <Dialog>
        <DialogTrigger className="py-[0.35rem] rounded-sm px-6 bg-blue-700 text-white transition-colors hover:bg-blue-800">
          View
        </DialogTrigger>
        <DialogContent className="min-w-[50%]" dir={websiteDirection}>
          <DialogHeader>
            <DialogTitle className="text-3xl text-center">Images</DialogTitle>
            <div>
              <div className="mt-12 mb-4">
                {images.map((image, index) => (
                  <div key={`${image}-${index}`}>
                    <Image src={image} alt="image" width={200} height={200} />
                  </div>
                ))}
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
