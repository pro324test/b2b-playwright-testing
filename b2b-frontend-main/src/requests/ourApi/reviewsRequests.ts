import { ourApiAxios, ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { AxiosInstance } from "axios";

const reviewsPrefix = `${ourApiPrefix}/reviews`;

export const reviewsRequests = {
  getReviewsOfProduct: ({
    productId,
    queryParams,
  }: {
    productId: number;
    queryParams?: DefaultQueryParams;
  }) =>
    ourApiAxios.get(
      `${reviewsPrefix}/product/${productId}${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  create: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${reviewsPrefix}/product`, data),
};
