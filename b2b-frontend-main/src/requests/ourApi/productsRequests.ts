import { ourApiAxios, ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { AxiosInstance } from "axios";

const productsPrefix = `${ourApiPrefix}/product`;

export const productsRequests = {
  getAll: ({ queryParams }: { queryParams?: DefaultQueryParams }) =>
    ourApiAxios.get(
      `${productsPrefix}${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  getAllProductsOfVendor: ({
    privateAxios,
    vendorId,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    vendorId: number;
    queryParams?: DefaultQueryParams;
  }) =>
    privateAxios.get(
      `${productsPrefix}/vendor/${vendorId}/public${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  getProductsByShopId: ({
    privateAxios,
    shopId,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    shopId: number;
    queryParams?: DefaultQueryParams;
  }) =>
    privateAxios.get(
      `${productsPrefix}/shop/${shopId}${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  create: ({
    privateAxios,
    data,
    shopId,
  }: {
    privateAxios: AxiosInstance;
    data: object;
    shopId: number;
  }) => privateAxios.post(`${productsPrefix}/shop/${shopId}`, data),
  edit: ({
    privateAxios,
    data,
    productId,
  }: {
    privateAxios: AxiosInstance;
    data: object;
    productId: number;
  }) => privateAxios.patch(`${productsPrefix}/${productId}`, data),
  createProductVariant: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${ourApiPrefix}/product-variants`, data),
  fetchById: (productId: number) =>
    fetch(`${productsPrefix}/${productId}`, { cache: "no-store" }),
  findById: (productId: number) =>
    ourApiAxios.get(`${productsPrefix}/${productId}`),
  enable: ({
    privateAxios,
    productId,
  }: {
    privateAxios: AxiosInstance;
    productId: number;
  }) => privateAxios.patch(`${productsPrefix}/${productId}/enable`),
  disable: ({
    privateAxios,
    productId,
  }: {
    privateAxios: AxiosInstance;
    productId: number;
  }) => privateAxios.patch(`${productsPrefix}/${productId}/disable`),
  getProductsOfCurrentVendor: ({
    privateAxios,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    queryParams?: DefaultQueryParams;
  }) =>
    privateAxios.get(
      `${productsPrefix}/vendor/products${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  delete: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.delete(`${productsPrefix}/${id}`),
};
