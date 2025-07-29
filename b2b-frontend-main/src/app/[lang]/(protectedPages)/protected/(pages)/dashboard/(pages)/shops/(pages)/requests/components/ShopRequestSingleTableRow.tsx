"use client";

import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { shopsRequests } from "@/requests/ourApi/shopsRequests";
import {
  ShopRequest,
  ShopRequestStatus,
} from "@/types/ourApiSepecifc/ShopRequest";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";

type Props = {
  shopRequest: ShopRequest;
};

export default function ShopRequestSingleTableRow({ shopRequest }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const router = useRouter();
  const privateAxios = usePrivateAxios({});
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const canChangeStatus =
    !isAccepting && !isRejecting && shopRequest.status == "pending";

  const changeStatusHandler = useCallback(async (status: ShopRequestStatus) => {
    try {
      const response = await shopsRequests.responsdToRequest({
        privateAxios,
        shopRequestId: shopRequest.id,
        data: {
          response: status,
        },
      });
      toastSuccessMessage({ dictionary, response });
      router.refresh();
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    }
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <tr>
        <td>{shopRequest.id}</td>
        <td>
          <span className={`status ${shopRequest.status}`}>
            {shopRequest.status}
          </span>
        </td>
        <td>{shopRequest.name}</td>
        <td
          className="cutted-text max-w-[25vw]"
          title={shopRequest.description}
        >
          {shopRequest.description}
        </td>
        <td className="flex justify-center gap-2">
          <button
            disabled={!canChangeStatus}
            className={"accept"}
            onClick={() => {
              if (!canChangeStatus) return;
              setIsAccepting(true);
              changeStatusHandler("accept").finally(() => {
                setIsAccepting(false);
              });
            }}
          >
            Accept
          </button>
          <button
            disabled={!canChangeStatus}
            className={"reject"}
            onClick={() => {
              if (!canChangeStatus) return;
              setIsRejecting(true);
              changeStatusHandler("reject").finally(() => {
                setIsRejecting(false);
              });
            }}
          >
            {false ? dictionary.pleaseWait : "Reject"}
          </button>
        </td>
      </tr>
    </>
  );
}
