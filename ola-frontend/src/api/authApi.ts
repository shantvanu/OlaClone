import axiosClient from "./axiosClient";

// User auth
export const register = (name: string, email: string, password: string) => {
  return axiosClient.post("/auth/register", { name, email, password });
};

export const login = (email: string, password: string) => {
  return axiosClient.post("/auth/login", { email, password });
};

// Driver auth
export const registerDriver = (name: string, email: string, password: string, vehicleType: string) => {
  return axiosClient.post("/auth/driver/register", { name, email, password, vehicleType });
};

export const loginDriver = (email: string, password: string) => {
  return axiosClient.post("/auth/driver/login", { email, password });
};

