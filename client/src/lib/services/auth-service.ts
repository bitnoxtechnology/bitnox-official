import API from "./axios-client";

type SignupPayload = {
  name: string;
  email: string;
};

type LoginPayload = {
  email: string;
};

type VerifyLoginOTPPayload = {
  email: string;
  otp: string;
  deviceFp: string;
};

type RefreshTokenPayload = {
  sessionId: string;
  deviceFp: string;
};

type AuthResponse = {
  success: boolean;
  message: string;
  data?: {
    user: UserType;
  };
};

type TokenResponse = {
  success: boolean;
  message: string;
  data?: {
    user: UserType;
    accessToken: string;
    sessionId: string;
  };
};

type LogoutResponse = {
  success: boolean;
  message: string;
};

export const authService = {
  /**
   * Submit signup form with name and email
   * This should trigger OTP sending to the email
   */
  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    try {
      const response = await API.post("/auth/signup", payload);
      return response.data;
    } catch (error: unknown) {
      const errorData = error as ErrorResponse;
      throw errorData || { success: false, message: "Signup failed" };
    }
  },

  /**
   * Submit login form with email
   * This should trigger OTP sending to the email
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await API.post("/auth/login", payload);
      return response.data;
    } catch (error: unknown) {
      const errorData = error as ErrorResponse;
      throw errorData || { success: false, message: "Login failed" };
    }
  },

  /**
   * Verify OTP and complete signup
   */
  verifyLoginOTP: async (
    payload: VerifyLoginOTPPayload
  ): Promise<TokenResponse> => {
    try {
      const response = await API.post("/auth/verify-login-otp", payload);
      return response.data;
    } catch (error: unknown) {
      const errorData = error as ErrorResponse;
      throw errorData || { success: false, message: "OTP verification failed" };
    }
  },

  /**
   * Resend OTP to email
   */
  resendOTP: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await API.post("/auth/resend-login-otp", { email });
      return response.data;
    } catch (error: unknown) {
      const errorData = error as ErrorResponse;
      throw errorData || { success: false, message: "Failed to resend OTP" };
    }
  },

  /**
   * Refresh Token
   */
  refreshToken: async (
    payload: RefreshTokenPayload
  ): Promise<TokenResponse> => {
    try {
      const response = await API.post(
        "/auth/refresh-token",
        {},
        {
          headers: {
            "x-session-id": payload.sessionId,
            "x-device-fp": payload.deviceFp,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorData = error as ErrorResponse;
      throw errorData || { success: false, message: "Failed to refresh token" };
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<LogoutResponse> => {
    try {
      const response = await API.post("/auth/logout", {});
      return response.data;
    } catch (error: unknown) {
      const errorData = error as ErrorResponse;
      throw errorData || { success: false, message: "Failed to logout" };
    }
  },
};
