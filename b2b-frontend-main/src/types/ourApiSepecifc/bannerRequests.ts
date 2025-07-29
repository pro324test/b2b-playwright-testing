import { ourApiAxios, ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "../global/DefaultQueryParams";
import { AxiosInstance } from "axios";

const bannersPrefix = `${ourApiPrefix}/banner`;

export const bannersRequests = {
  getActiveBanners: ({ queryParams }: { queryParams?: DefaultQueryParams }) =>
    ourApiAxios.get(`${bannersPrefix}/active`, { params: queryParams }),
  findById: ({ id }: { id: number }) =>
    ourApiAxios.get(`${bannersPrefix}/${id}`),
  getBannersOfShop: ({
    shopId,
    queryParams,
  }: {
    shopId: number;
    queryParams?: DefaultQueryParams;
  }) =>
    ourApiAxios.get(`${bannersPrefix}/shop/${shopId}`, { params: queryParams }),
  create: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(bannersPrefix, data),
  edit: ({
    privateAxios,
    id,
    data,
  }: {
    privateAxios: AxiosInstance;
    id: number;
    data: object;
  }) => privateAxios.patch(`${bannersPrefix}/${id}`, data),
  delete: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.delete(`${bannersPrefix}/${id}`),
};
