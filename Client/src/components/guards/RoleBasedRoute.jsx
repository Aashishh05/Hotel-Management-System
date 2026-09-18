import React from "react";
import useAuth from "../../hooks/useAuth.js";
import { Navigate, Outlet } from "react-router-dom";

const RoleBasedRoute = ({ roles }) => {
  const { user } = useAuth();

  const userRole = user?.role?.name;

  if (userRole === "superadmin") {
    return <Outlet />;
  }

  if (!roles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;
