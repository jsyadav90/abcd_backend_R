import express from "express";
import {
  loginUser,
  logoutUser,
  // refreshAccessToken,
} from "../controllers/auth.controller.js";

import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ================= AUTH ROUTES ================= */

// login
router.post("/login", loginUser);

// refresh access token
// router.post("/refresh-token", refreshAccessToken);

// logout (protected)
router.post("/logout", verifyAccessToken, logoutUser);

export default router;
