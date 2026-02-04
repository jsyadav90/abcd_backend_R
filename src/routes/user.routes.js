import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserLogin,
} from "../controllers/user.controller.js";

import { verifyAccessToken } from "../middlewares/auth.middleware.js"
import { csrfProtection } from "../middlewares/csrf.middleware.js";


const router = express.Router();

router.get("/",
  //  verifyAccessToken, 
  // csrfProtection,
   getUsers);
   
router.get("/:id", getUserById);
router.post("/", verifyAccessToken, createUser);
router.put("/:id", updateUser);
router.delete("/:id", verifyAccessToken,deleteUser);

// ENABLE LOGIN
router.patch("/:id/toggle-login", toggleUserLogin);

export default router;
