"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/redux/config/hooks";
import Link from "next/link";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SelectShopToCreateProductModal({
  isOpen,
  setIsOpen,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const lang = useLang();
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const shops = authEntity?.vendor?.shops || [];
  return (
    <Dialog open={isOpen}>
      <DialogContent className="hide-x-button min-w-[50%] hide-x-buttton">
        <DialogHeader>
          <DialogTitle className="flex justify-center text-3xl">
            <span>Select A Shop to Create Product</span>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-4 mb-2">
              {shops.length === 0 ? (
                <p className="text-center text-lg font-semibold">
                  No shops found. Please create a shop first.
                </p>
              ) : (
                <div className="flex gap-4 flex-wrap justify-center">
                  {shops.map((shop) => (
                    <Link
                      key={shop.id}
                      href={routes.dashboardCreateProductForShop.href({
                        lang,
                        id: shop.id,
                      })}
                      className="bg-blue-600 text-white py-2 px-6 rounded-md transition-colors hover:bg-blue-700"
                    >
                      {shop.name}
                    </Link>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="block mt-8 mx-auto py-2 px-6 text-2xl rounded-xl text-white bg-red-600 transition-colors hover:bg-red-700"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                {dictionary.cancel}
              </button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
