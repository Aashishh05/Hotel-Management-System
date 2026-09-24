import { useSelector } from "react-redux";

const usePermission = (module, action) => {
  const { user } = useSelector((state) => state.auth);
  const { permissions } = useSelector((state) => state.permission);

  if (user?.role?.name === "superadmin") {
    return true;
  }

  const moduleperms = permissions?.modules?.[module];

  return moduleperms?.[action] ?? false;
};


export default usePermission;