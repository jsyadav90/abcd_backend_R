import express from "express";
import {
  login,
  refreshAccessToken,
  logoutUser,
  logoutAllDevices,
  getMe,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);

router.post("/logout", authenticate, logoutUser);
router.post("/logout-all", authenticate, logoutAllDevices);

router.get("/me", authenticate, getMe);

export default router;
