import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getMeApi } from "../../api/authApi";
import { getMyPermissions } from "../../api/permissionApi";
import { logout, setLoading, setUser } from "../../redux/authSlice";
import { setPermission } from "../../redux/permissionSlice";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await getMeApi();

        if (res?.data) {
          dispatch(setUser(res.data));

          try {
            const permRes = await getMyPermissions();
            dispatch(setPermission(permRes?.permission));
          } catch {
            dispatch(setPermission(null));
          }
        } else {
          dispatch(logout());
        }
      } catch (error) {
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  return children;
};

export default AuthInitializer;
