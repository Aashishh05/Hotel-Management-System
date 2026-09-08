export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
};

export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token") || null;
};

export const removeUser = () => {
  localStorage.removeItem("user");
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

export const clearStorage = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("posts");
};
