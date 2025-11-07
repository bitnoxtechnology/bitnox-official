import { Request } from "express";

declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      userId?: string;
    }
  }

  interface ContactUsEmail {
    name: string;
    email: string;
    message: string;
  }
}
