import { ourApiPrefix } from "@/constants/ourApiConstants";
import { AxiosInstance } from "axios";

const productVariantsPrefix = `${ourApiPrefix}/product-variants`;

export const productVariantsRequests = {
  create: ({
    privateAxios,
    data,
  }: {
    privateAxios: AxiosInstance;
    data: object;
  }) => privateAxios.post(productVariantsPrefix, data),
  edit: ({
    privateAxios,
    data,
    productVariantId,
  }: {
    privateAxios: AxiosInstance;
    data: object;
    productVariantId: number;
  }) =>
    privateAxios.patch(`${productVariantsPrefix}/${productVariantId}`, data),
  delete: ({ privateAxios, id }: { privateAxios: AxiosInstance; id: number }) =>
    privateAxios.delete(`${productVariantsPrefix}/${id}`),
};
