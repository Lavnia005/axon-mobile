import { apiRequest } from "@/services/api";
import {
  AuthResponse,
  LoginData,
  RegisterData,
  User,
} from "@/types/auth";

export const authService = {
  login(data: LoginData) {
    return apiRequest<AuthResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  register(data: RegisterData) {
    return apiRequest<AuthResponse>("/users/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getProfile(token: string) {
    return apiRequest<User>("/users/me", {
      method: "GET",
      token,
    });
  },
};