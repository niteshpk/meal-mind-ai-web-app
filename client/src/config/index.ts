/**
 * Application configuration loaded from environment variables
 */

const env: any = (import.meta as any).env;

export const config = {
  api: {
    url: env.VITE_API_URL || "http://localhost:3001",
  },
  app: {
    name: env.VITE_APP_NAME || "MealMind AI",
    mode: env.VITE_APP_MODE || "development",
  },
} as const;
