import { getEnv } from "../lib/helpers";

const appConfig = () => ({
  PORT: getEnv("PORT", "3000"),
  HOST: getEnv("HOST"),
  API_BASE_PATH: getEnv("API_BASE_PATH", "/api/v1"),
  CLIENT_ORIGIN: getEnv("CLIENT_ORIGIN"),
  NODE_ENV: getEnv("NODE_ENV"),
  RESEND_API_KEY: getEnv("RESEND_API_KEY"),
  MONGO_URI: getEnv("MONGO_URI"),

  JWT: {
    ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
    ACCESS_EXPIRES_IN: getEnv("JWT_ACCESS_EXPIRES_IN", "1d"),
    REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
    REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "30d"),
  },
});

export const config = appConfig();
