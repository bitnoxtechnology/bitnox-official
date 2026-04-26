import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { Navigate } from "react-router-dom";
import AdminLayout from "@/layout/AdminLayout";

const ProtectedRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="h-screen w-full flex flex-col items-center justify-center gap-4"
        style={{ background: "#0a0a0a" }}
      >
        <Spinner className="size-12" style={{ color: "#05e4fc" }} />
        <span className="text-sm" style={{ color: "#94a3b8" }}>
          Authenticating...
        </span>
      </div>
    );
  }

  return user ? <AdminLayout /> : <Navigate to={"/auth/login"} replace />;
};

export default ProtectedRoutes;
