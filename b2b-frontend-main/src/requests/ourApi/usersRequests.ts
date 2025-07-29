import { ourApiAxios, ourApiPrefix } from "@/constants/ourApiConstants";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { AxiosInstance } from "axios";

const usersPrefix = `${ourApiPrefix}/user`;

export const usersRequests = {
  login: ({ identifier, password }: { identifier: string; password: string }) =>
    ourApiAxios.post(`${ourApiPrefix}/auth/login`, { identifier, password }),
  register: (data: {
    firstName: string;
    lastName: string;
    username: string;
    email?: string;
    phoneNumber: string;
    password: string;
    lang?: string;
  }) => ourApiAxios.post(`${ourApiPrefix}/auth/signup`, data),
  requestLoginOtp: ({
    phoneNumber,
    lang,
  }: {
    phoneNumber: string;
    lang?: string;
  }) =>
    ourApiAxios.post(`${ourApiPrefix}/auth/request-login-otp`, {
      phoneNumber,
      lang,
    }),
  loginWithOtp: ({
    phoneNumber,
    otp,
    lang,
  }: {
    phoneNumber: string;
    otp: string;
    lang?: string;
  }) =>
    ourApiAxios.post(`${ourApiPrefix}/auth/login-with-otp`, {
      phoneNumber,
      otpCode: otp,
      lang,
    }),
  verifyRegistration: ({
    otp,
    phoneNumber,
    lang,
  }: {
    otp: string;
    phoneNumber: string;
    lang?: string;
  }) =>
    ourApiAxios.post(`${ourApiPrefix}/auth/verify-registration`, {
      otpCode: otp,
      phoneNumber,
      lang,
    }),
  forgotPassword: ({
    phoneNumber,
    lang,
  }: {
    phoneNumber: string;
    lang?: string;
  }) =>
    ourApiAxios.post(`${ourApiPrefix}/auth/forgot-password`, {
      phoneNumber,
      lang,
    }),
  resetPassword: ({
    otp,
    phoneNumber,
    newPassword,
    lang,
  }: {
    otp: string;
    phoneNumber: string;
    newPassword: string;
    lang?: string;
  }) =>
    ourApiAxios.post(`${ourApiPrefix}/auth/reset-password`, {
      otpCode: otp,
      phoneNumber,
      newPassword,
      lang,
    }),

  getUsers: ({
    privateAxios,
    queryParams,
  }: {
    privateAxios: AxiosInstance;
    queryParams: DefaultQueryParams;
  }) =>
    privateAxios.get(
      `${usersPrefix}/all${
        queryParams ? `?${new URLSearchParams(queryParams)}` : ""
      }`
    ),
};
