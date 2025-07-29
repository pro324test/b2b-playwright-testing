"use client";

import { useState } from "react";
import CartStep from "./steps/CartStep";
import { CheckoutStep } from "../types/CheckoutStep";
import AddressStep from "./steps/AddressStep";
import PaymentStep from "./steps/PaymentStep";
import { UserAddress } from "@/types/ourApiSepecifc/UserAddress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAppSelector } from "@/redux/config/hooks";
import toast from "react-hot-toast";
import { toastErrorStylesObject } from "@/constants/toastStylesObjectConstants";
import styles from "./styles/CartPageContentContainerStyles.module.css";

export default function CartPageContentContainer() {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [activeStep, setActiveStep] = useState<CheckoutStep>("cart");
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null
  );

  return (
    <Accordion
      type="single"
      collapsible
      className={styles["accordion"]}
      value={activeStep}
      onValueChange={(value) => {
        if (selectedAddress === null && value === "payment") {
          toast("Please select an address", { style: toastErrorStylesObject });
          return;
        }
        setActiveStep(value as CheckoutStep);
      }}
    >
      <AccordionItem value={"cart"}>
        <AccordionTrigger className="padding-x bg-color">
          {dictionary.cartContent}
        </AccordionTrigger>
        <AccordionContent>
          <CartStep setActiveStep={setActiveStep} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value={"address"}>
        <AccordionTrigger className="padding-x bg-color">
          {dictionary.addresses}
        </AccordionTrigger>
        <AccordionContent>
          <AddressStep
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
            setActiveStep={setActiveStep}
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value={"payment"}>
        <AccordionTrigger
          className={`padding-x bg-color ${
            selectedAddress ? "" : "cursor-not-allowed opacity-50"
          }`}
        >
          {dictionary.paymentMethods}
        </AccordionTrigger>
        <AccordionContent>
          <PaymentStep
            selectedAddress={selectedAddress!}
            setActiveStep={setActiveStep}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
