import { ourApiAxios, ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";

const contentManagementTypesPrefix = `${ourApiPrefix}/content/type`;

export const contentManagementTypesRequests = {
  getAll: ({ queryParams }: { queryParams?: DefaultQueryParams }) =>
    ourApiAxios.get(`${contentManagementTypesPrefix}`, { params: queryParams }),
  create: ({ privateAxios, data }: { privateAxios: any; data: object }) =>
    privateAxios.post(`${contentManagementTypesPrefix}`, data),
  edit: ({
    privateAxios,
    id,
    data,
  }: {
    privateAxios: any;
    id: number;
    data: object;
  }) => privateAxios.patch(`${contentManagementTypesPrefix}/${id}`, data),
  delete: ({ privateAxios, id }: { privateAxios: any; id: number }) =>
    privateAxios.delete(`${contentManagementTypesPrefix}/${id}`),
};
