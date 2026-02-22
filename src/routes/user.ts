import { Router } from "express";
import auth from "../middleware/auth";
import { validate } from "../middleware/validation";
import { userController } from "../controllers/user.controller";

import { userRegisterSchema, userLoginSchema, userUpdateSchema, userIdParamsSchema } from "../schemas/user.schema";

const router = Router();

router.get("/", auth, userController.list);

router.get("/:id", auth, validate({ params: userIdParamsSchema }), userController.getById);

router.post("/register", validate({ body: userRegisterSchema }), userController.register);

router.post("/login", validate({ body: userLoginSchema }), userController.login);

router.put("/:id", auth, validate({ params: userIdParamsSchema, body: userUpdateSchema }), userController.update);

router.delete("/:id", auth, validate({ params: userIdParamsSchema }), userController.remove);

export { router as userRoute };