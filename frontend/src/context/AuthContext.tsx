import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, getErrorMessage } from "@/lib/api";
import type { AuthResponse, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setAuth: (data: AuthResponse) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "propspace_token";
const USER_KEY = "propspace_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  const setAuth = useCallback((data: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    const { data } = await api.get<User>("/users/me");
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    setUser(data);
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        await refreshUser();
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, [token, refreshUser, logout]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
        setAuth(data);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [setAuth]
  );

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      try {
        const { data } = await api.post<AuthResponse>("/auth/register", {
          email,
          username,
          password,
        });
        setAuth(data);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [setAuth]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      setAuth,
    }),
    [user, token, isLoading, login, register, logout, refreshUser, setAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
