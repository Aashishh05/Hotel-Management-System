import { useSelector } from "react-redux";

const usePermission = (module, action) => {
  const { user } = useSelector((state) => state.auth);
  const { permission } = useSelector((state) => state.permission);

  if (user?.role?.name === "superadmin") {
    return true;
  }

  const moduleperms = permission?.modules?.[module];

  return moduleperms?.[action] ?? false;
};


export default usePermission;