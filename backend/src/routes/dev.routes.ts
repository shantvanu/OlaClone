import { Router } from "express";
import { seedDevData } from "../controllers/dev.controller";

const router = Router();

// /dev/seed – create demo user & drivers for quick testing
router.post("/seed", seedDevData);

export default router;


