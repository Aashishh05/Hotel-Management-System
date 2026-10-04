import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";

// Keeps the guest role out of the staff area. PermissionRoute alone cannot do
// this because the guest role legitimately holds read/create on bookings, menu
// and restaurant for its own portal endpoints, which is the same module the
// staff pages sit behind.

const StaffRoute = () => {
  const { user } = useAuth();

  if (user?.role?.name === "guest") {
    return <Navigate to="/guest" replace />;
  }

  return <Outlet />;
};

export default StaffRoute;