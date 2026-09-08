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
      };
    }
  } catch (error) {
    console.log("Failed to load auth state", error);
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
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
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
