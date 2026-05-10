import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@/types/user";
import type { UserRole } from "@/types/roles";
import { API_BASE, TOKEN_KEY } from "@/config/api";

interface AuthContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (cardId: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
  }, []);

  const login = useCallback(async (cardId: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ schoolCardId: cardId, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Login failed" }));
      throw new Error(err.message || "Login failed");
    }

    const data = await res.json();
    const { token, user: dbUser } = data.data;

    // Persist token for subsequent API calls
    localStorage.setItem(TOKEN_KEY, token);

    const roleMap: Record<string, UserRole> = {
      ADMIN: "ADMIN",
      OPERATOR: "OPERATOR",
      LEARNER: "LEARNER",
      FACULTY: "FACULTY",
      IT_TEAM: "IT_TEAM",
      FINANCE_OFFICE: "FINANCE",
    };

    setUserState({
      id: dbUser.userId,
      name: dbUser.fullName,
      email: dbUser.email,
      role: roleMap[dbUser.role] || "LEARNER",
      cardStatus: dbUser.userStatus === "ACTIVE" ? "Active" : "Inactive",
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUserState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}