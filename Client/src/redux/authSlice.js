import {
  getToken,
  getUser,
  removeToken,
  removeUser,
  setToken,
  setUser,
} from "../localStorage/storage.js";
import { createSlice } from "@reduxjs/toolkit";

const loadAuthState = () => {
  try {
    const user = getUser();
    const token = getToken();

    if (user && token) {
      return {
        user,
        token,
        isAuthenticated: true,
        loading: false,
      };
    }
  } catch (error) {
    console.log("Failed to load auth state", error);
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
  };
};

const initialState = loadAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      const { user, token } = action.payload;

      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      setUser(user);
      setToken(token);
    },

    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      removeToken();
      removeUser();
    },

    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { login, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
