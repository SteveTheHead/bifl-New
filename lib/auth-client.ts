import { createAuthClient } from "better-auth/react";

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
});

// Export commonly used methods
export const { signIn, signUp, signOut, useSession } = authClient;
