import { ourApiAxios, ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { AxiosInstance } from "axios";

const attributesPrefix = `${ourApiPrefix}/attribute`;

export const attributesRequests = {
  getAll: ({ queryParams }: { queryParams?: DefaultQueryParams }) =>
    ourApiAxios.get(
      `${attributesPrefix}${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  findById: ({
    id,
    privateAxios,
  }: {
    id: number;
    privateAxios: AxiosInstance;
  }) => privateAxios.get(`${attributesPrefix}/${id}`),
  create: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${attributesPrefix}`, data),
  edit: ({
    privateAxios,
    id,
    data,
  }: {
    privateAxios: AxiosInstance;
    id: number;
    data: object;
  }) => privateAxios.patch(`${attributesPrefix}/${id}`, data),
  delete: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.delete(`${attributesPrefix}/${id}`),
  enable: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.patch(`${attributesPrefix}/enable/${id}`),
  disable: ({
    privateAxios,
    id,
  }: {
    privateAxios: AxiosInstance;
    id: number;
  }) => privateAxios.patch(`${attributesPrefix}/disable/${id}`),
  createValue: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${attributesPrefix}/value`, data),
};
