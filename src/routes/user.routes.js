import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserLogin,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// ENABLE LOGIN
router.patch("/:id/toggle-login", toggleUserLogin);

export default router;
