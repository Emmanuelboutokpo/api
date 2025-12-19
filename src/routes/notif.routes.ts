import express from "express";
import { getNotifications } from "../controllers/notification.controller";
  
const router = express.Router();

router.get("/notif", getNotifications);

export default router;
