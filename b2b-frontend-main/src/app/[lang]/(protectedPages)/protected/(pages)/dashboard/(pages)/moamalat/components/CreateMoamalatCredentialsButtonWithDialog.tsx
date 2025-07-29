"use client";

import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/redux/config/hooks";
import useWebsiteDirection from "@/hooks/useWebsiteDirection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FaRegPlusSquare } from "react-icons/fa";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { useRouter } from "next/navigation";

import { moamalatRequests } from "@/requests/ourApi/moamalatRequests";

export default function CreateMoamalatCredentialsButtonWithDialog() {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});
  const websiteDirection = useWebsiteDirection();
  const router = useRouter();
  const [merchantId, setMerchantId] = useState("");
  const [terminalId, setTerminalId] = useState("");
  const [secureKey, setSecureKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isAdmin =
    authEntity?.role == "admin" || authEntity?.role == "superadmin";

  const canSubmit = merchantId != "" && terminalId != "" && secureKey != "";

  const handleSubmit = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = isAdmin
        ? await moamalatRequests.createSystemCredentials({ privateAxios, data })
        : await moamalatRequests.createVendorCredentials({
            privateAxios,
            data,
          });
      toastSuccessMessage({ dictionary, response });
      router.refresh();
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Dialog>
      <DialogTrigger
        className={
          "py-2 px-6 bg-green-600 text-white flex gap-4 justify-center items-center"
        }
      >
        <FaRegPlusSquare />

        <span> Create New Credentials</span>
      </DialogTrigger>
      <DialogContent className="min-w-[50%]" dir={websiteDirection}>
        <DialogHeader>
          <DialogTitle className="text-3xl text-center">
            Create Moamalat Credentials
          </DialogTitle>
          <div>
            <div className="mt-12 mb-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading || !canSubmit) return;

                  handleSubmit({
                    merchantId,
                    terminalId,
                    secureKey,
                  });
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

                <div className="flex">
                  <button
                    disabled={!canSubmit || isLoading}
                    className="mt-8 bg-green-600  py-2 px-6 rounded-xl text-white transition-colors hover:bg-green-700"
                  >
                    {isLoading ? dictionary.pleaseWait : dictionary.confirm}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
