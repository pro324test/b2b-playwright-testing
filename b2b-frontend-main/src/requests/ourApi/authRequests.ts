import { ourApiAxios, ourApiPrefix } from "@/constants/ourApiConstants";

export const authRequests = {
  getMe: (accessToken: string) =>
    ourApiAxios.get(`${ourApiPrefix}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }),
};
