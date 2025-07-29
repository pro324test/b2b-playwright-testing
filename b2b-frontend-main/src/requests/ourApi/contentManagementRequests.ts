import { ourApiAxios, ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";

const contentManagementPrefix = `${ourApiPrefix}/content`;

export const contentManagementRequests = {
  getAll: ({ queryParams }: { queryParams?: DefaultQueryParams }) =>
    ourApiAxios.get(`${contentManagementPrefix}`, { params: queryParams }),
  create: ({ privateAxios, data }: { privateAxios: any; data: object }) =>
    privateAxios.post(`${contentManagementPrefix}`, data),
  edit: ({
    privateAxios,
    id,
    data,
  }: {
    privateAxios: any;
    id: number;
    data: object;
  }) => privateAxios.patch(`${contentManagementPrefix}/${id}`, data),
  delete: ({ privateAxios, id }: { privateAxios: any; id: number }) =>
    privateAxios.delete(`${contentManagementPrefix}/${id}`),
  publish: ({ privateAxios, id }: { privateAxios: any; id: number }) =>
    privateAxios.patch(`${contentManagementPrefix}/${id}/publish`),
  unpublish: ({ privateAxios, id }: { privateAxios: any; id: number }) =>
    privateAxios.patch(`${contentManagementPrefix}/${id}/unpublish`),
  findById: (id: number) => ourApiAxios.get(`${contentManagementPrefix}/${id}`),
};
