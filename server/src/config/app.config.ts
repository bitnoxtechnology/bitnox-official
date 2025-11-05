import { getEnv } from "../lib/helpers";

const appConfig = () => ({
  PORT: getEnv("PORT", "3000"),
  HOST: getEnv("HOST", "localhost"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  RESEND_API_KEY: getEnv("RESEND_API_KEY"),
});

export const config = appConfig();
