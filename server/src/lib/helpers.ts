import bcrypt from "bcryptjs";

export const getEnv = (key: string, defaultValue: string = ""): string => {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(`Enviroment variable ${key} is not set`);
  }
  return value;
};

export const hashValue = async (value: string, saltRounds: number = 10) => {
  return await bcrypt.hash(value, saltRounds);
};
