import { ourApiPrefix } from "@/constants/ourApiConstants";
import { AxiosInstance } from "axios";

const inventoriesPrefix = `${ourApiPrefix}/inventory`;

export const inventoriesRequests = {
  editProductInventory: ({
    privateAxios,
    productId,
    data,
  }: {
    privateAxios: AxiosInstance;
    productId: number;
    data: object;
  }) => privateAxios.patch(`${inventoriesPrefix}/${productId}`, data),
};
