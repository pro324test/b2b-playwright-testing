"use client";

import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { usePathname, useRouter } from "next/navigation";
import { Shop } from "@/types/ourApiSepecifc/Shop";
import { shopsRequests } from "@/requests/ourApi/shopsRequests";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import { authRequests } from "@/requests/ourApi/authRequests";
import { AxiosResponse } from "axios";
import { AuthEntity } from "@/types/global/AuthEntity";
import { updateUser } from "@/redux/features/auth/authSlice";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  shop: Shop;
};

export default function EditShopModal({ isOpen, setIsOpen, shop }: Props) {
  const pathname = usePathname();
  const lang = useLang();
  const isMyShopsPage =
    pathname === routes.dashboardMyShops.startsWith({ lang });
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const dispatch = useAppDispatch();
  const privateAxios = usePrivateAxios({});
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(shop.name);
  const [description, setDescription] = useState(shop.description);

  const canSubmit = name && description;

  const editHandler = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await shopsRequests.edit({
        privateAxios,
        shopId: shop.id,
        data,
      });
      toastSuccessMessage({ dictionary, response });
      if (isMyShopsPage) {
        // update user data
        try {
          const myResponse: AxiosResponse<AuthEntity> =
            await authRequests.getMe(authEntity?.accessToken || "");
          const userData = myResponse.data;

          dispatch(updateUser({ ...userData }));
        } catch {
        } finally {
          setIsLoading(false);
          router.refresh();
          setIsOpen(false);
        }
      }
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);
  return (
    <Dialog open={isOpen}>
      <DialogContent className="hide-x-button min-w-[50%] hide-x-buttton">
        <DialogHeader>
          <DialogTitle className="flex justify-center text-3xl">
            <span>
              Edit Shop
              <span className="text-blue-600">&apos;{shop.name}&apos;</span>
            </span>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-4 mb-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading || !canSubmit) return;
                  editHandler({ name, description });
                }}
              >
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    disabled={!canSubmit || isLoading}
                    className="mt-8 bg-green-600  py-2 px-6 rounded-xl text-white transition-colors hover:bg-green-700"
                  >
                    {isLoading ? dictionary.pleaseWait : dictionary.confirm}
                  </button>
                  <button
                    disabled={isLoading}
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="mt-8 bg-red-600  py-2 px-6 rounded-xl text-white transition-colors hover:bg-red-700"
                  >
                    {dictionary.cancel}
                  </button>
                </div>
              </form>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
