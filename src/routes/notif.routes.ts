import express from "express";
import { getNotifications } from "../controllers/notification.controller";
import { requireSignin } from "../middlewares/requireSignin";
 
const router = express.Router();

router.get("/notif", requireSignin, getNotifications);

export default router;
