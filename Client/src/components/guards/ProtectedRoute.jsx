import React from "react";
import useAuth from "../../hooks/useAuth.js";
import { Navigate, Outlet } from "react-router-dom";

const protectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default protectedRoute;
