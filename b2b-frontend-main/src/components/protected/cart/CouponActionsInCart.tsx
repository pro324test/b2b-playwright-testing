"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import { updateCart } from "@/redux/features/cart/cartSlice";
import { cartRequests } from "@/requests/ourApi/cartRequests";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import React, { useCallback, useState } from "react";

export default function CouponActionsInCart() {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const cart = useAppSelector((state) => state.cartSlice.cart);
  const privateAxios = usePrivateAxios({});
  const dispatch = useAppDispatch();
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isCouponApplied = cart?.appliedCouponCode !== null;

  const applyCoupon = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await cartRequests.applyCoupon({
        privateAxios,
        cartId: cart?.id || 0,
        data,
      });
      dispatch(updateCart(response.data));
      toastSuccessMessage({ dictionary, response });
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  const removeCoupon = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await cartRequests.removeCoupon({
        privateAxios,
        cartId: cart?.id || 0,
      });
      dispatch(updateCart(response.data));
      toastSuccessMessage({ dictionary, response });
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isLoading || (!isCouponApplied && !couponCode)) return;
          if (isCouponApplied) {
            removeCoupon();
          } else {
            applyCoupon({ code: couponCode });
          }
        }}
      >
        <div className="p-4 flex gap-2 items-end">
          <div className="grid w-full  items-center gap-1.5">
            <Label htmlFor="coupon">Coupon</Label>
            <Input
              type="text"
              id="coupon"
              placeholder="CODE"
              value={isCouponApplied ? cart!.appliedCouponCode! : couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={isLoading || isCouponApplied}
            />
          </div>
          <button
            className={`text-white py-1.5 px-2 rounded-md min-w-[125px] transition-colors ${
              !isCouponApplied
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
            disabled={isLoading || (!isCouponApplied && !couponCode)}
          >
            {isLoading
              ? "Please Wait..."
              : isCouponApplied
              ? "Remove Coupon"
              : "Apply"}
          </button>
        </div>
      </form>
    </>
  );
}
