import type { AuthProvider } from "@refinedev/core";
import type { AdminUser, AdminRole } from "../types";
import { API_BASE_URL, LOGTO_ENDPOINT, LOGTO_APP_ID } from "../utils/constants";

const TOKEN_KEY = "unjynx_admin_token";
const REFRESH_TOKEN_KEY = "unjynx_admin_refresh_token";
const USER_KEY = "unjynx_admin_user";

/**
 * Maps backend role names (lowercase/underscore) to frontend AdminRole names (uppercase).
 * Backend stores: "user", "super_admin", "dev_admin"
 * Frontend expects: "SUPER_ADMIN", "CONTENT_MANAGER", "SUPPORT_AGENT", "VIEWER"
 */
const BACKEND_ROLE_MAP: Readonly<Record<string, AdminRole>> = {
  super_admin: "SUPER_ADMIN",
  dev_admin: "SUPER_ADMIN",     // dev_admin gets full admin access in admin panel
  content_manager: "CONTENT_MANAGER",
  support_agent: "SUPPORT_AGENT",
  user: "VIEWER",
};

function mapBackendRole(backendRole: string | null | undefined): AdminRole {
  if (!backendRole) return "VIEWER";
  return BACKEND_ROLE_MAP[backendRole.toLowerCase()] ?? "VIEWER";
}

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser(): AdminUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

function storeAuth(token: string, refreshToken: string, user: AdminUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken(): string | null {
  return getStoredToken();
}

export const authProvider: AuthProvider = {
  login: async ({ email, password, providerName }) => {
    // SSO / OIDC flow: redirect to Logto
    if (providerName === "logto") {
      const redirectUri = `${window.location.origin}/callback`;
      const authUrl =
        `${LOGTO_ENDPOINT}/oidc/auth?` +
        `client_id=${LOGTO_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=openid+profile+email&` +
        `prompt=consent`;

      window.location.href = authUrl;
      return { success: true };
    }

    // Email/password login via backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: json.error ?? "Invalid credentials",
          },
        };
      }

      const { token, refreshToken, user } = json.data;

      const adminUser: AdminUser = {
        id: user.id,
        email: user.email,
        name: user.name ?? user.email,
        avatarUrl: user.avatarUrl,
        role: mapBackendRole(user.role),
      };

      storeAuth(token, refreshToken, adminUser);

      return {
        success: true,
        redirectTo: "/",
      };
    } catch {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Network error. Please try again.",
        },
      };
    }
  },

  logout: async () => {
    const token = getStoredToken();

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Best-effort logout
      }
    }

    clearAuth();

    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = getStoredToken();
    const user = getStoredUser();

    if (!token || !user) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    return { authenticated: true };
  },

  getIdentity: async () => {
    const user = getStoredUser();
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatarUrl,
      role: user.role,
    };
  },

  getPermissions: async () => {
    const user = getStoredUser();
    return user?.role ?? "VIEWER";
  },

  onError: async (error) => {
    const status = error?.statusCode ?? error?.status;
    if (status === 401) {
      clearAuth();
      return {
        logout: true,
        redirectTo: "/login",
      };
    }
    return { error };
  },
};
