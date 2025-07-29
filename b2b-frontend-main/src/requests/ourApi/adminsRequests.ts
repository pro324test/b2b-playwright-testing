import { ourApiAxios, ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { AxiosInstance } from "axios";

const adminsPrefix = `${ourApiPrefix}/admin`;

export const adminsRequests = {
  login: ({ identifier, password }: { identifier: string; password: string }) =>
    ourApiAxios.post(`${adminsPrefix}/login`, { identifier, password }),
  getAll: ({
    privateAxios,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    queryParams?: DefaultQueryParams;
  }) =>
    privateAxios.get(
      `${adminsPrefix}/admins${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  disable: ({
    privateAxios,
    id,
  }: {
    privateAxios: AxiosInstance;
    id: number;
  }) => privateAxios.patch(`${adminsPrefix}/disable/${id}`),
  enable: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.patch(`${adminsPrefix}/enable/${id}`),
  create: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${adminsPrefix}/create`, data),
  delete: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.delete(`${adminsPrefix}/delete/${id}`),
};
