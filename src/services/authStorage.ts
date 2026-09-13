import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "axon_auth_token";

export const authStorage = {
  async saveToken(token: string) {
    if (Platform.OS === "web") {
      localStorage.setItem(TOKEN_KEY, token);
      return;
    }

    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async getToken() {
    if (Platform.OS === "web") {
      return localStorage.getItem(TOKEN_KEY);
    }

    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async removeToken() {
    if (Platform.OS === "web") {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};