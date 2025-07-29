"use client";

import React, { useCallback, useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import { AxiosResponse } from "axios";
import { cartRequests } from "@/requests/ourApi/cartRequests";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { updateCart } from "@/redux/features/cart/cartSlice";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { UserAddress } from "@/types/ourApiSepecifc/UserAddress";
import { MoamalatResponse } from "@/types/global/MomalatResponse";

declare global {
  interface Window {
    Lightbox: any;
    Toaster?: {
      postMessage: (msg: string) => void;
    };
  }
}

type Props = {
  isOpen: boolean;
  selectedAddress: UserAddress;
};

export default function PayViaMoamalat({ isOpen, selectedAddress }: Props) {
  const lang = useLang();
  const privateAxios = usePrivateAxios({});
  const cart = useAppSelector((state) => state.cartSlice.cart);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const checkoutHandler = useCallback(async (data: object) => {
    setIsCreatingOrder(true);
    try {
      const response: AxiosResponse<{ orderId: number }> =
        await cartRequests.checkout({ privateAxios, data });
      dispatch(updateCart(null));
      router.push(
        routes.singleOrder.href({ lang, orderId: response.data.orderId })
      );
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsCreatingOrder(false);
    }
    // eslint-disable-next-line
  }, []);

  const hexToAscii = (str: string) => {
    let output = "";
    for (let i = 0; i < str.length; i += 2) {
      output += String.fromCharCode(parseInt(str.substr(i, 2), 16));
    }
    return output;
  };

  const openLightBox = () => {
    setLoading(true);
    setSuccess(false);
    setError(false);

    const amount = 1;
    const now = new Date();
    const dt =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0") +
      now.getHours().toString().padStart(2, "0") +
      now.getMinutes().toString().padStart(2, "0");

    const tID = "86161988";
    const mID = "10002937774";
    const merchRef = "";
    const merchantKey = hexToAscii("fdasfsda");

    const strHashData =
      "Amount=" +
      amount +
      "&DateTimeLocalTrxn=" +
      dt +
      "&MerchantId=" +
      mID +
      "&MerchantReference=" +
      merchRef +
      "&TerminalId=" +
      tID;

    const hmacSHA256 = CryptoJS.HmacSHA256(strHashData, merchantKey)
      .toString()
      .toUpperCase();

    console.log("HMAC SHA256:", hmacSHA256);

    if (!window.Lightbox || !window.Lightbox.Checkout) {
      alert("Lightbox script is not loaded.");
      setLoading(false);
      return;
    }

    window.Lightbox.Checkout.configure = {
      MID: mID,
      TID: tID,
      AmountTrxn: amount,
      MerchantReference: merchRef,
      TrxDateTime: dt,
      SecureHash: hmacSHA256,
      completeCallback: function (data: MoamalatResponse) {
        console.log("Payment completed:", data);
        setLoading(false);
        setSuccess(true);
        const orderData = {
          paymentMethod: "moamalat",
          addressId: selectedAddress.id,
          shopId: cart?.items[0].product.shopId,
          transactionId: data.Transactions[0].DateTransactions[0].TransactionId,
        };
        checkoutHandler(orderData);
        //   window.Toaster?.postMessage('1');
      },
      errorCallback: function (error: any) {
        console.error("Payment error:", error);
        setLoading(false);
        setError(true);
        //   window.Toaster?.postMessage('2');
      },
      cancelCallback: function (data: any) {
        console.log("Payment cancelled:", data);
        setLoading(false);
        //   window.Toaster?.postMessage('3');
      },
    };

    window.Lightbox.Checkout.showLightbox();
  };

  useEffect(() => {
    if (isOpen) {
      openLightBox();
    }
    // eslint-disable-next-line
  }, [isOpen]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (isCreatingOrder) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div>
      {/* <button
          onClick={openLightBox}
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Pay'}
        </button> */}

      {success && (
        <div className="text-green-600 mt-2">✔ Success! Payment completed.</div>
      )}
      {error && (
        <div className="text-red-600 mt-2">❌ Error! Invalid credentials.</div>
      )}
    </div>
  );
}
