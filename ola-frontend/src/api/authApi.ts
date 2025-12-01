import axiosClient from "./axiosClient";

export const register = (name: string, email: string, password: string) => {
  return axiosClient.post("/auth/register", { name, email, password });
};

export const login = (email: string, password: string) => {
  return axiosClient.post("/auth/login", { email, password });
};
