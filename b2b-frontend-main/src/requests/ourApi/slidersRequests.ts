import { ourApiAxios, ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { AxiosInstance } from "axios";

const slidersPrefix = `${ourApiPrefix}/sliders`;

export const slidersRequests = {
  getAll: ({ queryParams }: { queryParams?: DefaultQueryParams }) =>
    ourApiAxios.get(`${slidersPrefix}`, { params: queryParams }),
  create: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${slidersPrefix}`, data),
  edit: ({
    privateAxios,
    id,
    data,
  }: {
    privateAxios: AxiosInstance;
    id: number;
    data: object;
  }) => privateAxios.patch(`${slidersPrefix}/${id}`, data),
  delete: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.delete(`${slidersPrefix}/${id}`),
};
