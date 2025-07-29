import { ourApiPrefix } from "@/constants/ourApiConstants";
import { AxiosInstance } from "axios";
import { DefaultQueryParams } from "../global/DefaultQueryParams";

const bannerTypesPrefix = `${ourApiPrefix}/banner/type`;

export const bannerTypesRequests = {
  getAll: ({
    privateAxios,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    queryParams?: DefaultQueryParams;
  }) => privateAxios.get(bannerTypesPrefix, { params: queryParams }),
  getById: ({
    privateAxios,
    id,
  }: {
    privateAxios: AxiosInstance;
    id: number;
  }) => privateAxios.get(`${bannerTypesPrefix}/${id}`),
  create: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(bannerTypesPrefix, data),
  edit: ({
    privateAxios,
    id,
    data,
  }: {
    privateAxios: AxiosInstance;
    id: number;
    data: object;
  }) => privateAxios.patch(`${bannerTypesPrefix}/${id}`, data),
  delete: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.delete(`${bannerTypesPrefix}/${id}`),
};
