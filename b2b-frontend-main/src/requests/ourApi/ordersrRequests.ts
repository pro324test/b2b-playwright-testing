import { ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { AxiosInstance } from "axios";

const ordersPrefix = `${ourApiPrefix}/orders`;

export const ordersRequests = {
  getAllByAdmin: ({
    privateAxios,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    queryParams?: DefaultQueryParams;
  }) =>
    privateAxios.get(
      `${ordersPrefix}/admin/all${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  getCurrentUserOrders: ({ privateAxios }: { privateAxios: AxiosInstance }) =>
    privateAxios.get(`${ordersPrefix}`),
  getById: ({
    privateAxios,
    orderId,
  }: {
    privateAxios: AxiosInstance;
    orderId: number;
  }) => privateAxios.get(`${ordersPrefix}/${orderId}`),
};
