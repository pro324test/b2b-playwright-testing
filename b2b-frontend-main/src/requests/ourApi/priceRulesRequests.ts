import { ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { AxiosInstance } from "axios";

const priceRulesPrefix = `${ourApiPrefix}/price-rules`;

export const priceRulesRequests = {
  getAll: ({
    privateAxios,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    queryParams?: DefaultQueryParams;
  }) =>
    privateAxios.get(
      `${priceRulesPrefix}${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  create: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${priceRulesPrefix}`, data),
  enable: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.patch(`${priceRulesPrefix}/${id}/enable`),
  disable: ({
    privateAxios,
    id,
  }: {
    privateAxios: AxiosInstance;
    id: number;
  }) => privateAxios.patch(`${priceRulesPrefix}/${id}/disable`),
  delete: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.delete(`${priceRulesPrefix}/${id}`),
  edit: ({
    privateAxios,
    data,
    id,
  }: {
    privateAxios: AxiosInstance;
    data: object;
    id: number;
  }) => privateAxios.patch(`${priceRulesPrefix}/${id}`, data),
  getPriceRulesOfVendor: ({
    privateAxios,
    vendorId,
  }: {
    privateAxios: AxiosInstance;
    vendorId: number;
  }) => privateAxios.get(`${priceRulesPrefix}/vendor/${vendorId}`),
  getMyPriceRules: ({ privateAxios }: { privateAxios: AxiosInstance }) =>
    privateAxios.get(`${priceRulesPrefix}/my-rules`),
};
