import { ourApiPrefix } from "@/constants/ourApiConstants";
import { AxiosInstance } from "axios";

const userAddressesPrefix = `${ourApiPrefix}/address/user`;

export const userAddressesRequests = {
  getAddressesForUser: ({ privateAxios }: { privateAxios: AxiosInstance }) =>
    privateAxios.get(`${userAddressesPrefix}`),
  createAddress: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${userAddressesPrefix}`, data),
  setDefaultAddress: ({
    privateAxios,
    addressId,
  }: {
    privateAxios: AxiosInstance;
    addressId: number;
  }) => privateAxios.patch(`${userAddressesPrefix}/${addressId}/default`),
  updateAddress: ({
    privateAxios,
    addressId,
    data,
  }: {
    privateAxios: AxiosInstance;
    addressId: number;
    data: object;
  }) => privateAxios.patch(`${userAddressesPrefix}/${addressId}`, data),
};
