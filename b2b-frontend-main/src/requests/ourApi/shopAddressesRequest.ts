import { ourApiPrefix } from "@/constants/ourApiConstants";
import { AxiosInstance } from "axios";

const shopAddressesPrefix = `${ourApiPrefix}/address/shop`;

export const shopAddressesRequests = {
  getAddressesForShop: ({
    privateAxios,
    shopId,
  }: {
    privateAxios: AxiosInstance;
    shopId: number;
  }) => privateAxios.get(`${shopAddressesPrefix}/${shopId}`),
  getAddress: ({
    privateAxios,
    addressId,
    shopId,
  }: {
    privateAxios: AxiosInstance;
    addressId: number;
    shopId: number;
  }) => privateAxios.get(`${shopAddressesPrefix}/${shopId}/${addressId}`),
  createAddress: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${shopAddressesPrefix}`, data),
  updateAddress: ({
    privateAxios,
    addressId,
    data,
  }: {
    privateAxios: AxiosInstance;
    addressId: number;
    data: object;
  }) => privateAxios.patch(`${shopAddressesPrefix}/${addressId}`, data),
  deleteAddress: ({
    privateAxios,
    addressId,
  }: {
    privateAxios: AxiosInstance;
    addressId: number;
  }) => privateAxios.delete(`${shopAddressesPrefix}/${addressId}`),
  setDefaultAddress: ({
    privateAxios,
    addressId,
    shopId,
  }: {
    privateAxios: AxiosInstance;
    addressId: number;
    shopId: number;
  }) =>
    privateAxios.patch(`${shopAddressesPrefix}/${addressId}/default`, {
      shopId: shopId,
    }),
};
