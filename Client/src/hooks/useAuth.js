import useDispatch, { useSelector } from "react-redux";
import { login, logout } from "../redux/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();

  const { user, token, isAuthenticated } = useSelector((state) => state.auth);

  const loginUser = (userData) => {
    dispatch(login(userData));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    isAuthenticated,
    loginUser,
    logoutUser,
  };
};

export default useAuth;
