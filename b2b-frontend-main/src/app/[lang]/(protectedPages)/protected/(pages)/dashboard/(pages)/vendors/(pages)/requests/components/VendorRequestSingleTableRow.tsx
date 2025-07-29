"use client";

import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { vendorsRequests } from "@/requests/ourApi/vendorsRequests";
import {
  VendorRequest,
  VendorRequestStatus,
} from "@/types/ourApiSepecifc/VendorRequest";
import { extractDateAndTime } from "@/utils/extractDateAndTime";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import React, { useCallback, useState } from "react";
import styles from "./styles/VendorRequestSingleTableRowStyles.module.css";
import { useRouter } from "next/navigation";

type Props = {
  vendorRequest: VendorRequest;
};

export default function VendorRequestSingleTableRow({ vendorRequest }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const dateAndTime = extractDateAndTime(vendorRequest.createdAt);
  const privateAxios = usePrivateAxios({});
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const canChangeStatus =
    !isAccepting && !isRejecting && vendorRequest.status == "pending";

  const changeStatusHandler = useCallback(
    async (status: VendorRequestStatus) => {
      try {
        const response = await vendorsRequests.responsdToRequest({
          privateAxios,
          vendorRequestId: vendorRequest.id,
          data: {
            status,
          },
        });
        toastSuccessMessage({ dictionary, response });
        router.refresh();
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      }
    },
    // eslint-disable-next-line
    []
  );

  return (
    <>
      <tr key={vendorRequest.id} className={styles["container"]}>
        <td>{vendorRequest.id}</td>
        <td>
          <span className={`status ${vendorRequest.status}`}>
            {vendorRequest.status}
          </span>
        </td>
        <td>
          {dateAndTime.date} {dateAndTime.time}
        </td>
        <td>{vendorRequest?.user?.email || ""}</td>
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
