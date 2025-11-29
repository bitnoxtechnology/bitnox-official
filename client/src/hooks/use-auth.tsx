import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export const useAuth = () => {
  const conext = useContext(AuthContext);
  if (!conext) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return conext;
};
