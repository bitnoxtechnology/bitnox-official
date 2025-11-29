import { createContext } from "react";

type AuthContextType = {
  user?: UserType;
  isLoading: boolean;
  verifyLoginOTP: (params: { email: string; otp: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokenManually: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
