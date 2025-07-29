"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CheckoutStep } from "../../types/CheckoutStep";
import { useAppSelector } from "@/redux/config/hooks";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { userAddressesRequests } from "@/requests/ourApi/userAddressesRequests";
import WebsiteIsLoading from "@/components/loaders/WebsiteIsLoading";
import CreateAddressModal from "@/components/protected/modals/addresses/CreateAddressModal";
import { UserAddress } from "@/types/ourApiSepecifc/UserAddress";
import styles from "./styles/AddressStepStyles.module.css";
import toast from "react-hot-toast";
import { toastErrorStylesObject } from "@/constants/toastStylesObjectConstants";

type Props = {
  selectedAddress: UserAddress | null;
  setSelectedAddress: React.Dispatch<React.SetStateAction<UserAddress | null>>;
  setActiveStep: React.Dispatch<React.SetStateAction<CheckoutStep>>;
};

export default function AddressStep({
  selectedAddress,
  setSelectedAddress,
  setActiveStep,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userAddressesRequests.getAddressesForUser({
        privateAxios,
      });
      setAddresses(response.data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    getAddresses();
    // eslint-disable-next-line
  }, []);

  if (isLoading) return <WebsiteIsLoading />;

  return (
    <>
      <CreateAddressModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        successCallback={getAddresses}
      />
      <div className="py-8 padding-x">
        {addresses.length == 0 ? (
          <div className="min-h-[60vh] flex flex-col gap-8 justify-center items-center">
            <h4 className="text-2xl font-bold text-center">
              {dictionary.noAddressessFoundPleaseAddnewNewAddressToProced}
            </h4>
            <button
              className="main-button"
              onClick={() => setIsModalOpen(true)}
            >
              {dictionary.addNewAddress}
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-8">
              <h4 className="text-2xl font-bold ">{dictionary.addresses}</h4>
              <button
                className="main-button !py-1"
                onClick={() => setIsModalOpen(true)}
              >
                {dictionary.addNewAddress}
              </button>
            </div>
            {addresses.map((address) => {
              const isSelected = selectedAddress?.id === address.id;
              return (
                <button
                  key={address.id}
                  className={`${styles["address-item"]} ${
                    isSelected ? styles["selected"] : ""
                  }`}
                  onClick={() => setSelectedAddress(address)}
                >
                  <h4 className="text-xl font-bold">{address.street}</h4>
                </button>
              );
            })}
            <div className="my-8">
              <button
                className="main-button !py-1"
                onClick={() => {
                  if (!selectedAddress) {
                    toast("Please select an address to proceed", {
                      style: toastErrorStylesObject,
                    });
                    return;
                  }
                  setActiveStep("payment");
                }}
              >
                {dictionary.next}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
