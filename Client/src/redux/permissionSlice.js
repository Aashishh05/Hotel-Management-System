import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "ghm_permissions";

const getStoredPermissions = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const storePermissions = (permissions) => {
  try {
    if (permissions) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // storage unavailable, ignore
  }
};

const initialState = {
  permissions: getStoredPermissions(),
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
      storePermissions(action.payload);
    },

    clearPermission(state) {
      state.permissions = {};
      state.error = null;
      storePermissions(null);
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