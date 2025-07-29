"use client";

import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { vendorsRequests } from "@/requests/ourApi/vendorsRequests";
import React, { useEffect, useState } from "react";
import RequestToBecomeAVendorModal from "./modals/RequestToBecomeAVendorModal";
import IphoneLoader from "../loaders/IphoneLoader";

interface Response {
  hasRequest: boolean;
  status: "pending" | "already_vendor" | null;
}

export default function VendorRequestWithActions() {
  const { pageKey } = useAppSelector((state) => state.otherSlice);
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});
  const [response, setResponse] = useState<Response | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    if (!authEntity || authEntity.role != "user") return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await vendorsRequests.getVendorRequestStatus({
          privateAxios,
        });
        setResponse(response.data);
      } catch {
        // error
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [pageKey]);

  if (isLoading) return <IphoneLoader />;

  if (
    !authEntity ||
    authEntity.role !== "user" ||
    response == null ||
    response.status == "already_vendor"
  )
    return null;
  if (response.status == "pending") {
    return (
      <p className="py-1 px-4 text-white bg-yellow-500">
        Vendor Request Status: Pending
      </p>
    );
  }
  return (
    <>
      <RequestToBecomeAVendorModal
        isOpen={modalIsOpen}
        setIsOpen={setModalIsOpen}
      />
      <button
        onClick={() => setModalIsOpen(true)}
        className="py-1 px-4 text-white bg-green-700"
      >
        Request to become a vendor
      </button>
    </>
  );
}
