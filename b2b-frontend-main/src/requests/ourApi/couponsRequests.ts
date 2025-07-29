import { ourApiPrefix } from "@/constants/ourApiConstants";
import { AxiosInstance } from "axios";

const couponsPrefix = `${ourApiPrefix}/coupons`;

export const couponsRequests = {
  create: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${couponsPrefix}`, data),
  adminGetAll: ({
    privateAxios,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    queryParams: object;
  }) => privateAxios.get(`${couponsPrefix}`, { params: queryParams }),
  getVendorCoupons: ({
    privateAxios,
    vendorId,
  }: {
    privateAxios: AxiosInstance;
    vendorId: number;
  }) => privateAxios.get(`${couponsPrefix}/vendor/${vendorId}`),
  getShopCoupons: ({
    privateAxios,
    shopId,
  }: {
    privateAxios: AxiosInstance;
    shopId: number;
  }) => privateAxios.get(`${couponsPrefix}/shop/${shopId}`),
  enable: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.patch(`${couponsPrefix}/${id}/enable`),
  disable: ({
    privateAxios,
    id,
  }: {
    privateAxios: AxiosInstance;
    id: number;
  }) => privateAxios.patch(`${couponsPrefix}/${id}/disable`),
  edit: ({
    privateAxios,
    id,
    data,
  }: {
    privateAxios: AxiosInstance;
    id: number;
    data: object;
  }) => privateAxios.patch(`${couponsPrefix}/${id}`, data),
  delete: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.delete(`${couponsPrefix}/${id}`),
};
