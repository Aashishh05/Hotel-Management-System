import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "ghm_user";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
};

const storeUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // storage unavailable, ignore
  }
};

const cachedUser = getStoredUser();

const initialState = {
  user: cachedUser,
  isAuthenticated: Boolean(cachedUser),
  loading: !cachedUser,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    login(state, action) {
      const user = action.payload.user;
      state.user = user;
      state.isAuthenticated = true;
      state.loading = false;
      storeUser(user);
    },

    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      storeUser(null);
    },

    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      storeUser(action.payload);
    },

    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { login, logout, setUser, setLoading } = authSlice.actions;

export default authSlice.reducer;