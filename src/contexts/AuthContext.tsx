import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { ApiError } from "@/services/api";
import { authService } from "@/services/authService";
import { authStorage } from "@/services/authStorage";
import { LoginData, RegisterData, User } from "@/types/auth";

type AuthContextData = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function login(data: LoginData) {
    const response = await authService.login(data);

    await authStorage.saveToken(response.token);

    setToken(response.token);
    setUser(response.user);
  }

 async function register(data: RegisterData) {
  await authService.register(data);
}

  async function logout() {
    await authStorage.removeToken();

    setToken(null);
    setUser(null);
  }

  useEffect(() => {
      async function restoreSession() {
        try {
          const storedToken = await authStorage.getToken();

          if (!storedToken) {
            return;
          }

          const profile = await authService.getProfile(storedToken);

          setToken(storedToken);
          setUser(profile);
        } catch (error) {
          const shouldLogout =
            error instanceof ApiError &&
            (error.status === 401 || error.status === 404);

          if (shouldLogout) {
            await authStorage.removeToken();

            setToken(null);
            setUser(null);
          }
        } finally {
          setIsLoading(false);
        }
      }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}