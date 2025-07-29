import { ourApiAxios, ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { AxiosInstance } from "axios";

const categoryPrefix = `${ourApiPrefix}/category`;

export const categoriesRequests = {
  getAll: ({ queryParams }: { queryParams?: DefaultQueryParams }) =>
    ourApiAxios.get(
      `${categoryPrefix}${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  getSubCategoriesOfCategory: (categoryId: number) =>
    ourApiAxios.get(`${categoryPrefix}/${categoryId}/subcategories`),
  create: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${categoryPrefix}`, data),
  edit: ({
    privateAxios,
    data,
    categoryId,
  }: {
    privateAxios: AxiosInstance;
    data: object;
    categoryId: number;
  }) => privateAxios.patch(`${categoryPrefix}/${categoryId}`, data),
  enable: ({
    privateAxios,
    categoryId,
  }: {
    privateAxios: AxiosInstance;
    categoryId: number;
  }) => privateAxios.patch(`${categoryPrefix}/enable/${categoryId}`),
  disable: ({
    privateAxios,
    categoryId,
  }: {
    privateAxios: AxiosInstance;
    categoryId: number;
  }) => privateAxios.patch(`${categoryPrefix}/disable/${categoryId}`),
  getRootCategories: ({ queryParams }: { queryParams?: DefaultQueryParams }) =>
    ourApiAxios.get(
      `${categoryPrefix}/root${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  delete: ({
    privateAxios,
    categoryId,
  }: {
    privateAxios: AxiosInstance;
    categoryId: number;
  }) => privateAxios.delete(`${categoryPrefix}/${categoryId}`),
  findByIdWithChildren: (categoryId: number) =>
    ourApiAxios.get(`${categoryPrefix}/${categoryId}/with-children`),
};
