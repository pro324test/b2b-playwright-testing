import { ourApiPrefix } from "@/constants/ourApiConstants";
import { AxiosInstance } from "axios";

const moamalatPrefix = `${ourApiPrefix}/moamalat`;

export const moamalatRequests = {
  getCredentialsByShopId: ({
    privateAxios,
    shopId,
  }: {
    privateAxios: AxiosInstance;
    shopId: number;
  }) => privateAxios.get(`${moamalatPrefix}/credentials/${shopId}`),
  createVendorCredentials: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${moamalatPrefix}/vendor/credentials`, data),
  getCurrentVendorCredentials: ({
    privateAxios,
  }: {
    privateAxios: AxiosInstance;
  }) => privateAxios.get(`${moamalatPrefix}/vendor/credentials`),
  editVendorCredentials: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.patch(`${moamalatPrefix}/vendor/credentials`, data),

  toggleActiveVendorCredentials: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.patch(`${moamalatPrefix}/vendor/credentials/status`, data),
  getDefaultSystemCredentials: ({
    privateAxios,
  }: {
    privateAxios: AxiosInstance;
  }) => privateAxios.get(`${moamalatPrefix}/admin/settings`),
  createSystemCredentials: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(`${moamalatPrefix}/admin/settings`, data),
  editSystemCredentials: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.patch(`${moamalatPrefix}/vendor/credentials`, data),
};
