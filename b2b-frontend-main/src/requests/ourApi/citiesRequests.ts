import { ourApiAxios, ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { AxiosInstance } from "axios";

const citiesPrefix = `${ourApiPrefix}/city`;

export const citiesRequests = {
  getAll: ({ queryParams }: { queryParams?: DefaultQueryParams }) =>
    ourApiAxios.get(
      `${citiesPrefix}${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  findById: (id: number) => ourApiAxios.get(`${citiesPrefix}/${id}`),
  create: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${citiesPrefix}`, data),
  edit: ({
    privateAxios,
    id,
    data,
  }: {
    privateAxios: AxiosInstance;
    id: number;
    data: object;
  }) => privateAxios.patch(`${citiesPrefix}/${id}`, data),
  delete: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.delete(`${citiesPrefix}/${id}`),
  enable: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.patch(`${citiesPrefix}/${id}/enable`),
  disable: ({
    privateAxios,
    id,
  }: {
    privateAxios: AxiosInstance;
    id: number;
  }) => privateAxios.patch(`${citiesPrefix}/${id}/disable`),
};
