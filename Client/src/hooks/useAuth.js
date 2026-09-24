import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../redux/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();

  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const loginUser = (userData) => {
    dispatch(login(userData));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  return {
    user,
    isAuthenticated,
    loading,
    loginUser,
    logoutUser,
  };
};

export default useAuth;
