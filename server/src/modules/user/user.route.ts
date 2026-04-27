import express from "express";
import requireAuth from "../../middlewares/authentication";
import requireRole from "../../middlewares/require-role";
import { userController } from "./user.controller";

const userRouter = express.Router();

userRouter.use(requireAuth, requireRole("super_admin"));

userRouter.get("/", userController.getAll);
userRouter.get("/:userId", userController.getOne);
userRouter.post("/", userController.create);
userRouter.patch("/:userId", userController.update);
userRouter.delete("/:userId", userController.remove);

export { userRouter };
