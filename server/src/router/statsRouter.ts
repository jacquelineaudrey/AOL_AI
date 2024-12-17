import { Router } from "express";
import { getStats } from "../controller/statsController";

const router = Router();

router.get("/:userId", getStats);

export default router;
