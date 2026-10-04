import { Navigate, Outlet } from "react-router-dom";
import usePermission from "../../hooks/usePermission.js";

//  Client side permission gate. The server still enforces every action through checkPermission, this only stops staff pages from rendering for roles that  have no business seeing them. Must sit inside ProtectedRoute so permissions are already loaded from Redux by the time it evaluates.
 
const PermissionRoute = ({ module, action = "read" }) => {
  const allowed = usePermission(module, action);

  if (!allowed) {
    return <Navigate to="/unauthorized" replace state={{ module }} />;
  }

  return <Outlet />;
};

export default PermissionRoute;