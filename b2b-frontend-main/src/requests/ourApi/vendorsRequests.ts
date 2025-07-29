import { ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { AxiosInstance } from "axios";

const vendorsPrefix = `${ourApiPrefix}/vendor`;

export const vendorsRequests = {
  getAll: ({
    privateAxios,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    queryParams?: DefaultQueryParams;
  }) =>
    privateAxios.get(
      `${vendorsPrefix}/all${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  disable: ({
    privateAxios,
    vendorId,
  }: {
    privateAxios: AxiosInstance;
    vendorId: number;
  }) => privateAxios.patch(`${vendorsPrefix}/disable/${vendorId}`),
  enable: ({
    privateAxios,
    vendorId,
  }: {
    privateAxios: AxiosInstance;
    vendorId: number;
  }) => privateAxios.patch(`${vendorsPrefix}/enable/${vendorId}`),
  getRequests: ({
    privateAxios,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    queryParams?: DefaultQueryParams;
  }) =>
    privateAxios.get(
      `${vendorsPrefix}/requests${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  responsdToRequest: ({
    privateAxios,
    vendorRequestId,
    data,
  }: {
    privateAxios: AxiosInstance;
    vendorRequestId: number;
    data: object;
  }) => privateAxios.patch(`${vendorsPrefix}/respond/${vendorRequestId}`, data),
  getGroups: ({
    privateAxios,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    queryParams?: DefaultQueryParams;
  }) =>
    privateAxios.get(
      `${vendorsPrefix}/groups/all${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
  createGroup: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${vendorsPrefix}/group`, data),
  requestToBecomeAVendor: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${vendorsPrefix}/request-with-documents`, data),
  editVendorGroup: ({
    privateAxios,
    vendorGroupId,
    data,
  }: {
    privateAxios: AxiosInstance;
    vendorGroupId: number;
    data: object;
  }) => privateAxios.patch(`${vendorsPrefix}/group/${vendorGroupId}`, data),
  deleteVendorGroup: ({
    privateAxios,
    vendorGroupId,
  }: {
    privateAxios: AxiosInstance;
    vendorGroupId: number;
  }) => privateAxios.delete(`${vendorsPrefix}/group/${vendorGroupId}`),
  deleteVendor: ({
    privateAxios,
    vendorId,
  }: {
    privateAxios: AxiosInstance;
    vendorId: number;
  }) => privateAxios.delete(`${vendorsPrefix}/${vendorId}`),
  manageVendorGroup: ({
    privateAxios,
    data,
    vendorGroupId,
  }: {
    privateAxios: AxiosInstance;
    data: object;
    vendorGroupId: number;
  }) =>
    privateAxios.patch(`${vendorsPrefix}/group/${vendorGroupId}/vendors`, data),
  getById: ({
    privateAxios,
    vendorId,
  }: {
    privateAxios: AxiosInstance;
    vendorId: number;
  }) => privateAxios.get(`${vendorsPrefix}/${vendorId}`),
  getVendorRequestStatus: ({ privateAxios }: { privateAxios: AxiosInstance }) =>
    privateAxios.get(`${vendorsPrefix}/request/check`),
};
