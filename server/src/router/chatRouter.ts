import { Router } from "express";
import { aiResponse, createChat, getChat, translateChat } from "../controller/chatController";

const router = Router();

router.get("/", getChat);
router.post("/", createChat);
router.post("/translate", translateChat);
router.post("/ai/:userId", aiResponse);

export default router;