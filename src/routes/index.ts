import { Router } from "express";
import { helloRoute } from "./hello";
import { userRoute } from "./user.route";

const router = Router();

// API routes
router.use("/user", userRoute);
router.use("/hello", helloRoute);

export default router;
