import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      accessToken: string;
      username: string;
    } & DefaultSession;
  }
  interface User extends DefaultUser {
    id: number;
    accessToken: string;
    username: string;
    email: string | null;
    // phone_number: string | null;
  }
}
