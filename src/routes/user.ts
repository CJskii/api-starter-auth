import { Router } from "express";
import auth from "../middleware/auth";
import { validateSchema } from "../middleware/validation";
import { userRegisterSchema, userLoginSchema, userUpdateSchema } from "../utils";

import { userController } from "../controllers/user.controller";

const router = Router();

router.get("/", auth, userController.list);
router.get("/:id", auth, userController.getById);

router.post("/register", validateSchema(userRegisterSchema), userController.register);
router.post("/login", validateSchema(userLoginSchema), userController.login);

router.put("/:id", auth, validateSchema(userUpdateSchema), userController.update);
router.delete("/:id", auth, userController.remove);

export { router as userRoute };
