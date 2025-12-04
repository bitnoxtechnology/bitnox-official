import crypto from "crypto";
import { Model } from "mongoose";

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

const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

export const generateUniqueSlug = async (
  title: string,
  model: Model<any>
): Promise<string> => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await model.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};
