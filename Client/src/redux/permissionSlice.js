import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  permissions: {},
  loading: false,
  error: null,
};

const permissionSlice = createSlice({
  name: "permission",
  initialState,

  reducers: {
    setPermission(state, action) {
      state.permissions = action.payload || {};
      state.error = null;
    },

    clearPermission(state) {
      state.permissions = {};
      state.error = null;
    },

    setPermissionLoading(state, action) {
      state.loading = action.payload;
    },

    setPermissionError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  setPermission,
  clearPermission,
  setPermissionLoading,
  setPermissionError,
} = permissionSlice.actions;

export default permissionSlice.reducer;
