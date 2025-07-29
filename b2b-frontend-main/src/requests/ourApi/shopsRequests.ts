import { ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { AxiosInstance } from "axios";

const shopsPrefix = `${ourApiPrefix}/shop`;

export const shopsRequests = {
  getAll: ({
    privateAxios,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    queryParams?: DefaultQueryParams;
  }) =>
    privateAxios.get(
      `${shopsPrefix}/all${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  getAllWithDetails: ({
    privateAxios,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    queryParams?: DefaultQueryParams;
  }) =>
    privateAxios.get(
      `${shopsPrefix}/all/admin${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  requestAShop: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${shopsPrefix}`, data),
  delete: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.delete(`${shopsPrefix}/${id}`),
  responsdToRequest: ({
    privateAxios,
    shopRequestId,
    data,
  }: {
    privateAxios: AxiosInstance;
    shopRequestId: number;
    data: object;
  }) => privateAxios.patch(`${shopsPrefix}/respond/${shopRequestId}`, data),
  getAllShopRequests: ({
    privateAxios,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    queryParams?: DefaultQueryParams;
  }) =>
    privateAxios.get(
      `${shopsPrefix}/requests${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  enable: ({
    privateAxios,
    shopId,
  }: {
    privateAxios: AxiosInstance;
    shopId: number;
  }) => privateAxios.patch(`${shopsPrefix}/enable/${shopId}`),
  disable: ({
    privateAxios,
    shopId,
  }: {
    privateAxios: AxiosInstance;
    shopId: number;
  }) => privateAxios.patch(`${shopsPrefix}/disable/${shopId}`),
  edit: ({
    privateAxios,
    shopId,
    data,
  }: {
    privateAxios: AxiosInstance;
    shopId: number;
    data: object;
  }) => privateAxios.patch(`${shopsPrefix}/${shopId}`, data),
  getShopRequestStatus: ({ privateAxios }: { privateAxios: AxiosInstance }) =>
    privateAxios.get(`${shopsPrefix}/request/check`),
  getShopsByVendorId: ({
    privateAxios,
    vendorId,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    vendorId: number;
    queryParams?: DefaultQueryParams;
  }) =>
    privateAxios.get(
      `${shopsPrefix}/vendor/${vendorId}${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
};
