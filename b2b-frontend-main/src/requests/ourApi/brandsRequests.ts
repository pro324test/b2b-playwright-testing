import { ourApiAxios, ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { AxiosInstance } from "axios";

const brandsPrefix = `${ourApiPrefix}/brand`;

export const brandsRequest = {
  getAll: ({ queryParams }: { queryParams?: DefaultQueryParams }) =>
    ourApiAxios.get(
      `${brandsPrefix}${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  findById: ({
    id,
    privateAxios,
  }: {
    id: number;
    privateAxios: AxiosInstance;
  }) => privateAxios.get(`${brandsPrefix}/${id}`),
  create: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${brandsPrefix}`, data),
  edit: ({
    privateAxios,
    id,
    data,
  }: {
    privateAxios: AxiosInstance;
    id: number;
    data: object;
  }) => privateAxios.patch(`${brandsPrefix}/${id}`, data),
  delete: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.delete(`${brandsPrefix}/${id}`),
};
