import { ourApiPrefix } from "@/constants/ourApiConstants";
import { AxiosInstance } from "axios";

const cartPrefix = `${ourApiPrefix}/cart`;

export const cartRequests = {
  getCurrentUserCart: ({ privateAxios }: { privateAxios: AxiosInstance }) =>
    privateAxios.get(cartPrefix),
  addItemToCart: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${cartPrefix}/item`, data),
  updateItemQuantity: ({
    privateAxios,
    data,
    cartItemId,
  }: {
    privateAxios: AxiosInstance;
    data: object;
    cartItemId: number;
  }) => privateAxios.patch(`${cartPrefix}/item/${cartItemId}`, data),
  removeItemFromCart: ({
    privateAxios,
    cartItemId,
  }: {
    privateAxios: AxiosInstance;
    cartItemId: number;
  }) => privateAxios.delete(`${cartPrefix}/item/${cartItemId}`),
  clearCart: ({ privateAxios }: { privateAxios: AxiosInstance }) =>
    privateAxios.delete(`${cartPrefix}/clear`),
  checkout: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${cartPrefix}/checkout`, data),
  applyCoupon: ({
    privateAxios,
    cartId,
    data,
  }: {
    privateAxios: AxiosInstance;
    cartId: number;
    data: object;
  }) => privateAxios.post(`${cartPrefix}/${cartId}/apply-coupon`, data),
  removeCoupon: ({
    privateAxios,
    cartId,
  }: {
    privateAxios: AxiosInstance;
    cartId: number;
  }) => privateAxios.delete(`${cartPrefix}/${cartId}/remove-coupon`),
};
