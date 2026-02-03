import express from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutUser);

export default router;
