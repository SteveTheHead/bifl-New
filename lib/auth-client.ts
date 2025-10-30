import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { polarClient } from "@polar-sh/better-auth";

// Auto-detect the correct base URL
const getBaseURL = () => {
  // In browser, use the current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback to env variable or localhost
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [organizationClient(), polarClient()],
});

// Export commonly used methods
export const { signIn, signUp, signOut, useSession } = authClient;

// Export the full client for advanced use cases
export { authClient };
