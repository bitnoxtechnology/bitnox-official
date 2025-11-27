import API from "./axios-client";

export type SignupPayload = {
  name: string;
  email: string;
};

export type VerifyOTPPayload = {
  email: string;
  otp: string;
};

export type SignupResponse = {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    email: string;
  };
};

interface ErrorResponse {
  success: boolean;
  message: string;
}

export const signupService = {
  /**
   * Submit signup form with name and email
   * This should trigger OTP sending to the email
   */
  signup: async (payload: SignupPayload): Promise<SignupResponse> => {
    try {
      const response = await API.post("/auth/signup", payload);
      return response.data;
    } catch (error: unknown) {
      const errorData = error as ErrorResponse;
      throw errorData || { success: false, message: "Signup failed" };
    }
  },

  /**
   * Verify OTP and complete signup
   */
  verifyOTP: async (payload: VerifyOTPPayload): Promise<SignupResponse> => {
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
  resendOTP: async (email: string): Promise<SignupResponse> => {
    try {
      const response = await API.post("/auth/resend-otp", { email });
      return response.data;
    } catch (error: unknown) {
      const errorData = error as ErrorResponse;
      throw errorData || { success: false, message: "Failed to resend OTP" };
    }
  },
};
