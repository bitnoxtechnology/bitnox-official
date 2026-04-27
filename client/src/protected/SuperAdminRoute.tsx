import { useAuth } from "@/hooks/use-auth";
import { Navigate, Outlet } from "react-router-dom";

const SuperAdminRoute = () => {
  const { user } = useAuth();
  return user?.role === "super_admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/admin" replace />
  );
};

export default SuperAdminRoute;
