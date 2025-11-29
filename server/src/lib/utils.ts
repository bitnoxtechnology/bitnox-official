import crypto from "crypto";

export const generateUniqueCode = (): string => {
  const code = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return code;
};

export const generateRandomId = (): string => {
  return crypto.randomUUID();
};

export const hashString = (input: string) => {
  return crypto.createHash("sha256").update(input).digest("hex");
};

export const minutesFromNow = (minutes: number): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now;
};

export const daysFromNow = (days: number): Date =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);
