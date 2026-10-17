import axiosClient from "./axiosClient";

export const login = async ({ email, password }) => {
  const response = await axiosClient.post("/auth/login", { email, password });
  return response.data; // User profile
};

export const register = async ({ name, email, password, role = "customer" }) => {
  const response = await axiosClient.post("/users", { name, email, password, role });
  return response.data;
};

export const getUsers = async () => {
  const response = await axiosClient.get("/users");
  return response.data;
};

