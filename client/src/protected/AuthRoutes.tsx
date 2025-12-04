import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { Navigate, Outlet } from "react-router-dom";

const AuthRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Spinner className="size-8 text-primary-300" />
          <span className="font-bold">Please Wait</span>
        </div>
      </div>
    );
  }

  return !user ? <Outlet /> : <Navigate to={"/admin"} replace />;
};

export default AuthRoutes;
