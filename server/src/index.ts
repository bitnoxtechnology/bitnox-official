import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { config } from "./config/app.config";
import { errorHandler } from "./middlewares/error-handler";
import { asyncHandler } from "./middlewares/async-handler";
import { emailRouter } from "./modules/email/email.route";
import { connectToDatabase } from "./database/db";
import { authRouter } from "./modules/auth/auth.route";

const isDevelopment = config.NODE_ENV === "development";

const app = express();
const BASE_PATH = config.API_BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(
  cors({
    origin: config.CLIENT_ORIGIN,
    credentials: true,
  })
);

// Logging middleware
app.use(
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    console.info(
      `Request Time: [${new Date().toISOString()}], Method:${req.method}, URL:${
        req.url
      }`
    );
    next();
  })
);

// Routes
app.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ message: "Server is Running!" });
  })
);

app.use(`${BASE_PATH}/email`, emailRouter);
app.use(`${BASE_PATH}/auth`, authRouter);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.info(
    `Server running on port ${config.PORT} in ${config.NODE_ENV} mode`
  );

  await connectToDatabase();
});
