import express from "express";
import { getNotifications } from "../controllers/notification.controller";
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.get("/notif", requireAuth(), getNotifications);

export default router;
