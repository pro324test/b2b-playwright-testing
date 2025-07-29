import { ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { AxiosInstance } from "axios";

const promotionsPrefix = `${ourApiPrefix}/promotions`;

export const promotionsRequests = {
  getPromotionsOfShop: ({
    privateAxios,
    shopId,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    shopId: number;
    queryParams?: DefaultQueryParams;
  }) =>
    privateAxios.get(
      `${promotionsPrefix}/shop/${shopId}${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  create: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${promotionsPrefix}`, data),
  editPromotion: ({
    privateAxios,
    data,
    promotionId,
  }: {
    privateAxios: AxiosInstance;
    data: object;
    promotionId: number;
  }) => privateAxios.patch(`${promotionsPrefix}/${promotionId}`, data),
  delete: ({
    privateAxios,
    promotionId,
  }: {
    privateAxios: AxiosInstance;
    promotionId: number;
  }) => privateAxios.delete(`${promotionsPrefix}/${promotionId}`),
  enable: ({
    privateAxios,
    promotionId,
  }: {
    privateAxios: AxiosInstance;
    promotionId: number;
  }) => privateAxios.patch(`${promotionsPrefix}/${promotionId}/enable`),
  disable: ({
    privateAxios,
    promotionId,
  }: {
    privateAxios: AxiosInstance;
    promotionId: number;
  }) => privateAxios.patch(`${promotionsPrefix}/${promotionId}/disable`),
};
