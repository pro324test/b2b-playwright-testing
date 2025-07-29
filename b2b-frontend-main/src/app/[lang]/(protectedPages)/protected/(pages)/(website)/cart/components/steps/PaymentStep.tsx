"use client";

import React, { useCallback, useState } from "react";
import { CheckoutStep } from "../../types/CheckoutStep";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import { assetsConstants } from "@/constants/assetsConstants";
import Image from "next/image";
import styles from "./styles/PaymentStepStyles.module.css";
import toast from "react-hot-toast";
import { toastErrorStylesObject } from "@/constants/toastStylesObjectConstants";
import { cartRequests } from "@/requests/ourApi/cartRequests";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { updateCart } from "@/redux/features/cart/cartSlice";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { useRouter } from "nextjs-toploader/app";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import { UserAddress } from "@/types/ourApiSepecifc/UserAddress";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import { AxiosResponse } from "axios";
import PayViaMoamalat from "@/components/protected/payments/moamalat/PayViaMoamalat";

type Props = {
  selectedAddress: UserAddress;
  setActiveStep: React.Dispatch<React.SetStateAction<CheckoutStep>>;
};

export default function PaymentStep({ selectedAddress }: Props) {
  const { cart } = useAppSelector((state) => state.cartSlice);
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const lang = useLang();
  const router = useRouter();
  const privateAxios = usePrivateAxios({});
  const dispatch = useAppDispatch();
  const [moamalatIsOpen, setMoamalatIsOpen] = useState(false);
  const paymentMethods = [
    {
      icon: assetsConstants.payOnDeliveryIcon,
      label: dictionary.payOnDelivery,
      value: "cod",
    },
    {
      icon: assetsConstants.bankCardIcon,
      label: dictionary.bankCard,
      value: "moamalat",
    },
    {
      icon: assetsConstants.bankCardIcon,
      label: "One Pay",
      value: "one-pay",
    },
  ];
  const deliveryMethods = [
    {
      label: dictionary.receivingFromStore,
      value: "pickup",
    },
    {
      label: dictionary.deliveryFromStore,
      value: "delivery",
    },
  ];
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkoutHandler = useCallback(async (data: object) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <PayViaMoamalat
        isOpen={moamalatIsOpen}
        selectedAddress={selectedAddress}
      />
      <div className={`mt-8 py-8 padding-x ${styles["container"]}`}>
        <div className="flex-1">
          <div className="relative">
            <h2 className={styles["heading-label"]}>
              {dictionary.paymentMethods}
            </h2>
            {paymentMethods.map((method) => {
              const isSelected = selectedPaymentMethod === method.value;
              return (
                <button
                  onClick={() => setSelectedPaymentMethod(method.value)}
                  key={method.value}
                  className={`${styles["payment-methods-button"]} ${
                    isSelected ? styles["selected"] : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Image
                      src={method.icon}
                      alt={method.label}
                      width={100}
                      height={100}
                      className="w-[30px] h-[30px]"
                    />
                    <span className="text-lg font-semibold">
                      {method.label}
                    </span>
                  </span>
                  <span className={styles["circle"]}></span>
                </button>
              );
            })}
          </div>
          <div className="relative mt-14">
            <h2 className={styles["heading-label"]}>
              {dictionary.pickupMethods}
            </h2>
            {deliveryMethods.map((method) => {
              const isSelected = selectedDeliveryMethod === method.value;
              return (
                <button
                  onClick={() => setSelectedDeliveryMethod(method.value)}
                  key={method.value}
                  className={`${styles["payment-methods-button"]} ${
                    isSelected ? styles["selected"] : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {method.label}
                    </span>
                  </span>
                  <span className={styles["circle"]}></span>
                </button>
              );
            })}
          </div>
        </div>
        <div className={styles["cart-summary-container"]}>
          <div>
            <h4 className="text-2xl font-bold">
              {dictionary.invoiceTotal} ({cart?.items.length} {dictionary.piece}
              )
            </h4>
            <div className="p-4 flex flex-col gap-2">
              <p className="flex justify-between">
                <span>{dictionary.totalItems}:</span>
                <span>
                  {cart?.subtotal} {dictionary.LYD}
                </span>
              </p>
              <p className="flex justify-between mb-2">
                <span>{dictionary.couponReductionAmount}:</span>
                <span>
                  {cart?.discount || 0} {dictionary.LYD}
                </span>
              </p>
              <p className="flex justify-between border-t pt-2 border-t-gray-200 font-bold">
                <span>{dictionary.totalPrice}:</span>
                <span>
                  {cart?.total} {dictionary.LYD}
                </span>
              </p>
            </div>
          </div>
          <button
            className={`main-button mt-4 flex justify-center items-center gap-2`}
            disabled={isLoading}
            onClick={() => {
              if (isLoading) return;
              if (!selectedPaymentMethod) {
                toast("Please select a payment method", {
                  style: toastErrorStylesObject,
                });
                return;
              }
              if (selectedPaymentMethod === "moamalat") {
                setMoamalatIsOpen(true);
                return;
              }

              const data = {
                paymentMethod: selectedPaymentMethod,
                addressId: selectedAddress.id,
                shopId: cart?.items[0].product.shopId,
              };
              checkoutHandler(data);
            }}
          >
            {isLoading ? <IphoneLoader /> : dictionary.confirmOrder}
          </button>
        </div>
      </div>
    </>
  );
}
