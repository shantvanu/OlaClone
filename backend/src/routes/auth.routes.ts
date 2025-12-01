import { Router } from "express";
import { register, login, registerDriver, loginDriver } from "../controllers/auth.controller";

const router = Router();

// User routes
router.post("/register", register);
router.post("/login", login);

// Driver routes
router.post("/driver/register", registerDriver);
router.post("/driver/login", loginDriver);

export default router;
