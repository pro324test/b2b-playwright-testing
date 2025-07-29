"use client";

import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/redux/config/hooks";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { useRouter } from "next/navigation";
import { MoamalatCredentials } from "@/types/ourApiSepecifc/MoamalatCredentials";
import { moamalatRequests } from "@/requests/ourApi/moamalatRequests";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  moamalatCredentials: MoamalatCredentials;
};

export default function EditMoamalatCredentialsModal({
  isOpen,
  setIsOpen,
  moamalatCredentials,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [merchantId, setMerchantId] = useState(moamalatCredentials.merchantId);
  const [terminalId, setTerminalId] = useState(moamalatCredentials.terminalId);
  const [secureKey, setSecureKey] = useState(moamalatCredentials.secureKey);
  const isAdmin =
    authEntity?.role == "admin" || authEntity?.role == "superadmin";

  const canSubmit = merchantId != "" && terminalId != "" && secureKey != "";

  const editHandler = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = isAdmin
        ? await moamalatRequests.editSystemCredentials({
            privateAxios,
            data,
          })
        : await moamalatRequests.editVendorCredentials({
            privateAxios,
            data,
          });
      toastSuccessMessage({ dictionary, response });
      router.refresh();
      setIsOpen(false);
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
            <span>Edit Moamalat Credentials</span>
          </DialogTitle>
          <DialogDescription>
            <div className="mt-4 mb-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading) return;
                  editHandler({ merchantId, terminalId, secureKey });
                }}
              >
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="merchant-id">Merchant Id</Label>
                  <Input
                    type="number"
                    id="merchant-id"
                    placeholder="123456789"
                    value={merchantId}
                    onChange={(e) => setMerchantId(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="terminal-id">Terminal Id</Label>
                  <Input
                    type="number"
                    id="terminal-id"
                    placeholder="123456789"
                    value={terminalId}
                    onChange={(e) => setTerminalId(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="secure-key">Secure Key</Label>
                  <Input
                    type="text"
                    id="secure-key"
                    placeholder="dds34243fsda32432"
                    value={secureKey}
                    onChange={(e) => setSecureKey(e.target.value)}
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
