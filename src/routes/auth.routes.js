import express from "express";
import {
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllDevices,
  getLoggedInDevices
} from "../controllers/auth.controller.js";

import { verifyAccessToken, authenticate } from "../middlewares/auth.middleware.js";
import { csrfProtection } from "../middlewares/csrf.middleware.js";
import { getCsrfToken } from "../controllers/auth.controller.js";

import {
  loginLimiter,
  refreshTokenLimiter,
  logoutLimiter,
} from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// 🔐 LOGIN
router.post("/login", loginLimiter, loginUser);

// 🔁 REFRESH TOKEN
router.post(
  "/refresh-token",
  refreshTokenLimiter,
  refreshAccessToken
);

// 🚪 LOGOUT (single device)
router.post(
  "/logout",
  verifyAccessToken,
  logoutLimiter,

  logoutUser
);

// 🚪 LOGOUT ALL DEVICES
router.post(
  "/logout-all",
  verifyAccessToken,
  logoutLimiter,
  logoutAllDevices
);
router.get("/devices", verifyAccessToken, getLoggedInDevices);
router.post("/logout-all", authenticate, logoutAllDevices);
router.get("/csrf-token", csrfProtection, getCsrfToken);

export default router;
