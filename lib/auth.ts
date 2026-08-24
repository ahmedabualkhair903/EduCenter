"use client";

const AUTH_COOKIE = "manara-auth";
const AUTH_STORAGE_KEY = "manara-user";

export type AuthUser = {
  email: string;
  role: "admin" | "employee";
};

const DEFAULT_USER: AuthUser = {
  email: "admin@example.com",
  role: "admin",
};

export function login(email: string, password: string): AuthUser {
  if (!email.trim() || !password.trim()) {
    throw new Error("بيانات تسجيل الدخول غير صحيحة.");
  }

  const user: AuthUser = {
    ...DEFAULT_USER,
    email: email.trim(),
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

  document.cookie = `${AUTH_COOKIE}=true; path=/; max-age=${
    60 * 60 * 24 * 7
  }; SameSite=Lax`;

  return user;
}

export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);

  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getCurrentUser(): AuthUser | null {
  try {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith(`${AUTH_COOKIE}=true`));
}