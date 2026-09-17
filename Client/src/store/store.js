import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/authSlice.js";
import permissionReducer from "../redux/permissionSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    permission: permissionReducer,
  },
});
