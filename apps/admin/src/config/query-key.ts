export const QUERY_KEY = {
  AUTH: {
    LOGIN: ["auth-login"],
    REGISTER: ["auth-register"],
    ME: ["auth", "me"],
    VERIFY_EMAIL: ["verify-email"],
    ONBOARDING: ["onboarding"],
    LOGOUT: ["auth-logout"],
    LOGOUT_ALL: ["auth-logout-all"],
  },
  USER: {
    PROFILE: ["user", "profile"],
  },
} as const
