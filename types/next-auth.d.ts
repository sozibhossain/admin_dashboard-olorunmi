import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    userId?: string;
    error?: string;
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      _id?: string;
      userId?: string;
      avatarUrl?: string;
    };
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    _id?: string;
    user?: {
      name?: string;
      email?: string;
      userId?: string;
      avatar?: {
        url?: string;
      };
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    role?: string;
    _id?: string;
    user?: {
      name?: string;
      email?: string;
      userId?: string;
      avatar?: {
        url?: string;
      };
    };
    error?: string;
  }
}