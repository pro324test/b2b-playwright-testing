"use client";

import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { shopsRequests } from "@/requests/ourApi/shopsRequests";
import React, { useEffect, useState } from "react";
import IphoneLoader from "../loaders/IphoneLoader";
import RequestAShop from "./modals/RequestAShop";

interface Response {
  hasPendingRequest: boolean;
}

export default function ShopRequestWithAction() {
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
        const response = await shopsRequests.getShopRequestStatus({
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

  if (response != null && response.hasPendingRequest) {
    return (
      <p className="py-1 px-4 text-white bg-yellow-500">
        Shop Request Status: Pending
      </p>
    );
  }
  if (authEntity?.vendor?.shops?.length) return null;
  if (
    authEntity?.role == "admin" ||
    authEntity?.role == "superadmin" ||
    authEntity?.role == "user"
  )
    return null;

  return (
    <>
      <RequestAShop isOpen={modalIsOpen} setIsOpen={setModalIsOpen} />
      <button
        onClick={() => setModalIsOpen(true)}
        className="py-1 px-4 text-white bg-green-700"
      >
        Request A Shop
      </button>
    </>
  );
}
