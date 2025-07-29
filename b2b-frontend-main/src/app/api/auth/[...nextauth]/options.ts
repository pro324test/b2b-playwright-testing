import { nextAuthIds } from "@/constants/nextAuthIds";
import { adminsRequests } from "@/requests/ourApi/adminsRequests";
import { usersRequests } from "@/requests/ourApi/usersRequests";
import { AuthEntity } from "@/types/global/AuthEntity";
import { AxiosResponse } from "axios";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const options: NextAuthOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: nextAuthIds.adminLogin,
      name: "Credentails",
      credentials: {
        identifier: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          const loginResponse: AxiosResponse<{
            accessToken: string;
            user: AuthEntity;
          }> = await adminsRequests.login({
            identifier: credentials?.identifier || "",
            password: credentials?.password || "",
            //   lang: credentials?.lang!,
          });
          const {
            user: { id, email, username, firstName, lastName, role },
            accessToken,
          } = loginResponse.data;
          const theUser = {
            accessToken,
            id,
            email,
            username,
            firstName,
            lastName,
            role,
          };
          return theUser;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || "Something went wrong";
          throw new Error(errorMessage);
        }
      },
    }),
    CredentialsProvider({
      id: nextAuthIds.userLogin,
      name: "Credentails",
      credentials: {
        identifier: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          const loginResponse: AxiosResponse<{
            accessToken: string;
            user: AuthEntity;
          }> = await usersRequests.login({
            identifier: credentials?.identifier || "",
            password: credentials?.password || "",
            //   lang: credentials?.lang!,
          });
          const {
            user: { id, email, username, firstName, lastName, role },
            accessToken,
          } = loginResponse.data;
          const theUser = {
            accessToken,
            id,
            email,
            username,
            firstName,
            lastName,
            role,
          };
          return theUser;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || "Something went wrong";
          throw new Error(errorMessage);
        }
      },
    }),
    //
    CredentialsProvider({
      id: nextAuthIds.userLoginWithOtp,
      name: "Credentails",
      credentials: {
        phoneNumber: {},
        otp: {},
      },
      async authorize(credentials) {
        try {
          const response: AxiosResponse<{
            accessToken: string;
            user: AuthEntity;
          }> = await usersRequests.loginWithOtp({
            phoneNumber: credentials?.phoneNumber || "",
            otp: credentials?.otp || "",
            //   lang: credentials?.lang!,
          });
          const {
            user: { id, email, username, firstName, lastName, role },
            accessToken,
          } = response.data;
          const theUser = {
            accessToken,
            id,
            email,
            username,
            firstName,
            lastName,
            role,
          };
          return theUser;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || "Something went wrong";
          throw new Error(errorMessage);
        }
      },
    }),
    CredentialsProvider({
      id: nextAuthIds.verifyRegistration,
      name: "Credentails",
      credentials: {
        phoneNumber: {},
        otp: {},
      },
      async authorize(credentials) {
        try {
          console.log("credentials in verifyRegistration", credentials);
          const response: AxiosResponse<{
            accessToken: string;
            user: AuthEntity;
          }> = await usersRequests.verifyRegistration({
            phoneNumber: credentials?.phoneNumber || "",
            otp: credentials?.otp || "",
            //   lang: credentials?.lang!,
          });
          const {
            user: { id, email, username, firstName, lastName, role },
            accessToken,
          } = response.data;
          const theUser = {
            accessToken,
            id,
            email,
            username,
            firstName,
            lastName,
            role,
          };
          return theUser;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || "Something went wrong";
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};
