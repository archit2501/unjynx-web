// ============================================================
// UNJYNX Dev Portal - Auth Provider (Logto OIDC)
// ============================================================

import type { AuthProvider } from "@refinedev/core";
import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import { LOGTO_CONFIG, API_BASE_URL } from "@/utils/constants";

const userManager = new UserManager({
  authority: LOGTO_CONFIG.authority,
  client_id: LOGTO_CONFIG.clientId,
  redirect_uri: LOGTO_CONFIG.redirectUri,
  post_logout_redirect_uri: LOGTO_CONFIG.postLogoutRedirectUri,
  scope: LOGTO_CONFIG.scopes.join(" "),
  response_type: "code",
  userStore: new WebStorageStateStore({ store: window.localStorage }),
});

const ALLOWED_ROLES = ["dev_admin", "super_admin"] as const;

const hasDevAccess = (roles: ReadonlyArray<string>): boolean =>
  roles.some((r) => (ALLOWED_ROLES as ReadonlyArray<string>).includes(r));

/** Cache for backend role to avoid repeated API calls */
const ROLE_CACHE_KEY = "unjynx_dev_portal_role_cache";
const ROLE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface RoleCacheEntry {
  readonly role: string;
  readonly fetchedAt: number;
}

function getCachedRole(): string | null {
  const raw = localStorage.getItem(ROLE_CACHE_KEY);
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as RoleCacheEntry;
    if (Date.now() - entry.fetchedAt < ROLE_CACHE_TTL_MS) {
      return entry.role;
    }
    localStorage.removeItem(ROLE_CACHE_KEY);
    return null;
  } catch {
    localStorage.removeItem(ROLE_CACHE_KEY);
    return null;
  }
}

function setCachedRole(role: string): void {
  const entry: RoleCacheEntry = { role, fetchedAt: Date.now() };
  localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(entry));
}

/**
 * Fetches the user's role from the backend /api/v1/auth/me endpoint.
 * Used as a fallback when OIDC token claims don't contain roles
 * (e.g., Logto stores roles in the backend DB, not in token claims).
 */
async function fetchRoleFromBackend(accessToken: string): Promise<string | null> {
  const cached = getCachedRole();
  if (cached) return cached;

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) return null;

    const json = await response.json();
    const role = json?.data?.adminRole ?? json?.data?.role ?? null;

    if (role) {
      setCachedRole(role);
    }
    return role;
  } catch {
    return null;
  }
}

/**
 * Resolves the user's roles, checking OIDC claims first, then falling back
 * to the backend API.
 */
async function resolveRoles(
  oidcRoles: ReadonlyArray<string>,
  accessToken: string | undefined,
): Promise<ReadonlyArray<string>> {
  if (oidcRoles.length > 0) return oidcRoles;
  if (!accessToken) return [];

  const backendRole = await fetchRoleFromBackend(accessToken);
  return backendRole ? [backendRole] : [];
}

export const authProvider: AuthProvider = {
  login: async () => {
    try {
      await userManager.signinRedirect();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: String(error),
        },
      };
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem(ROLE_CACHE_KEY);
      await userManager.signoutRedirect();
      return { success: true };
    } catch {
      // Even if logout fails, clear local state
      localStorage.removeItem(ROLE_CACHE_KEY);
      await userManager.removeUser();
      return { success: true, redirectTo: "/" };
    }
  },

  check: async () => {
    try {
      const user = await userManager.getUser();
      if (user && !user.expired) {
        const oidcRoles = (user.profile?.roles as string[]) ?? [];
        const roles = await resolveRoles(oidcRoles, user.access_token);
        if (hasDevAccess(roles)) {
          return { authenticated: true };
        }
        return {
          authenticated: false,
          error: {
            name: "Forbidden",
            message: "Insufficient permissions. Dev admin or super admin role required.",
          },
          logout: true,
        };
      }
      return { authenticated: false, redirectTo: "/login" };
    } catch {
      return { authenticated: false, redirectTo: "/login" };
    }
  },

  getPermissions: async () => {
    const user = await userManager.getUser();
    if (!user) return [];
    const oidcRoles = (user.profile?.roles as string[]) ?? [];
    return resolveRoles(oidcRoles, user.access_token);
  },

  getIdentity: async () => {
    const user = await userManager.getUser();
    if (!user) return null;
    const oidcRoles = (user.profile?.roles as string[]) ?? [];
    const roles = await resolveRoles(oidcRoles, user.access_token);
    return {
      id: user.profile.sub,
      name: user.profile.name ?? user.profile.email ?? "Developer",
      avatar: user.profile.picture ?? undefined,
      email: user.profile.email,
      roles,
    };
  },

  onError: async (error) => {
    const status = (error as { statusCode?: number })?.statusCode;
    if (status === 401 || status === 403) {
      return { logout: true, redirectTo: "/login" };
    }
    return { error };
  },
};

export { userManager };
