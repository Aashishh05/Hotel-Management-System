import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getMeApi } from "../../api/authApi";
import { logout, setLoading, setUser } from "../../redux/authSlice";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await getMeApi();

        if (res?.data) {
          dispatch(setUser(res.data));
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
