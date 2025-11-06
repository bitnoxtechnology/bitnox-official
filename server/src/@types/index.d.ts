import { Request } from "express";

declare global {
  namespace Express {
    // interface Request {
    //   sessionId?: string;
    //   role?: string;
    //   userId?: string;
    // }
  }

  interface ContactUsEmail {
    name: string;
    email: string;
    message: string;
  }
}
