import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@/types/user";
import type { UserRole } from "@/types/roles";

interface AuthContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  /** Có thể gọi API backend để đăng nhập sau này */
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Mock user - thay bằng API call thực tế */
const MOCK_USERS: Record<UserRole, User> = {
  LEARNER: {
    id: "1",
    name: "Quach Gia Bao",
    email: "quachgiabao@example.com",
    role: "LEARNER",
    cardStatus: "Active",
  },
  FACULTY: {
    id: "2",
    name: "Trần Thị B",
    email: "faculty@example.com",
    role: "FACULTY",
    cardStatus: "Active",
  },
  OPERATOR: {
    id: "3",
    name: "Lê Văn C",
    email: "operator@example.com",
    role: "OPERATOR",
    cardStatus: "Active",
  },
  ADMIN: {
    id: "4",
    name: "Admin System",
    email: "admin@example.com",
    role: "ADMIN",
    cardStatus: "Active",
  },
  IT_TEAM: {
    id: "5",
    name: "IT Team Member",
    email: "it@hcmut.edu.vn",
    role: "IT_TEAM",
    cardStatus: "Active",
  },
  FINANCE: {
    id: "6",
    name: "Finance Office",
    email: "finance@hcmut.edu.vn",
    role: "FINANCE",
    cardStatus: "Active",
  },
  SUPER: {
    id: "7",
    name: "Super Admin",
    email: "super@hcmut.edu.vn",
    role: "SUPER",
    cardStatus: "Active",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    // TODO: Gọi API backend thực tế
    const found = Object.values(MOCK_USERS).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (found) {
      setUserState(found);
    } else {
      throw new Error("Invalid credentials");
    }
  }, []);

  const logout = useCallback(() => {
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
