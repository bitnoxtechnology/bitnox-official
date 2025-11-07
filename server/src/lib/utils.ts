export const generateUniqueCode = (): string => {
  const code = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return code;
};

export const minutesFromNow = (minutes: number): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now;
};
