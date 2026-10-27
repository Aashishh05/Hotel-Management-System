import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

// Access tokens are short-lived and refreshed via the backend when they
// expire. Endpoints that are *about* auth are excluded so wrong-password
// logins cannot trigger a refresh loop.
const REFRESH_PATH = "/auth/refresh";
const authPaths = ["/auth/login", "/auth/refresh", "/auth/logout"];

let refreshRequest = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};

    if (
      error.response?.status !== 401 ||
      original._retry ||
      authPaths.some((path) => (original.url || "").includes(path))
    ) {
      return Promise.reject(error);
    }

    try {
      // Share one refresh between concurrent 401s; raw axios keeps this
      // call out of the interceptor's way.
      if (!refreshRequest) {
        refreshRequest = axios
          .post(REFRESH_PATH, null, {
            baseURL: import.meta.env.VITE_BASE_URL,
            withCredentials: true,
          })
          .finally(() => {
            refreshRequest = null;
          });
      }

      await refreshRequest;

      original._retry = true;

      return api(original);
    } catch {
      return Promise.reject(error);
    }
  },
);

export default api;
