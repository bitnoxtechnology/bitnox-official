import { getDeviceFingerprint } from "@/lib/device";
import { authService } from "@/lib/services/auth-service";
import { tokenStorage } from "@/lib/token";
import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | undefined>(undefined);
  const [isLoading, setLoading] = useState(true);

  // on mount -> try silent refresh using session_id + device fingerprint
  useEffect(() => {
    (async () => {
      const sessionId = localStorage.getItem("session_id");
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const deviceFp = await getDeviceFingerprint();

        const res = await authService.refreshToken({ sessionId, deviceFp });

        if (res.success) {
          tokenStorage.set(res.data?.accessToken as string);
          setUser(res.data?.user as UserType);
        }
      } catch (error) {
        localStorage.removeItem("session_id");
        tokenStorage.clear();
        setUser(undefined);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const verifyLoginOTP = async ({
    email,
    otp,
  }: {
    email: string;
    otp: string;
  }) => {
    const deviceFp = await getDeviceFingerprint();
    try {
      const res = await authService.verifyLoginOTP({
        email,
        otp,
        deviceFp,
      });
      if (res.success) {
        tokenStorage.set(res.data?.accessToken as string);
        localStorage.setItem("session_id", res.data?.sessionId as string);
        setUser(res.data?.user as UserType);
      }
    } catch (error) {
      const errorData = error as ErrorResponse;
      throw errorData;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem("session_id");
      tokenStorage.clear();
      setUser(undefined);
    } catch (error) {
      const errorData = error as ErrorResponse;
      throw errorData;
    }
  };

  // expose for debugging: force refresh manually
  const refreshTokenManually = async () => {
    const sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      const deviceFp = await getDeviceFingerprint();

      const res = await authService.refreshToken({ sessionId, deviceFp });

      if (res.success) {
        tokenStorage.set(res.data?.accessToken as string);
        setUser(res.data?.user as UserType);
      }
    } catch (err) {
      console.error("Silent refresh failed: ", err);
      localStorage.removeItem("session_id");
      tokenStorage.clear();
      setUser(undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, verifyLoginOTP, logout, refreshTokenManually }}
    >
      {children}
    </AuthContext.Provider>
  );
};
