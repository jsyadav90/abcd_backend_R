import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserLogin 
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getUsers);              // get all users
router.get("/:id", getUserById);        // get single user
router.post("/", createUser);           // add user
router.put("/:id", updateUser);         // update user
router.delete("/:id", deleteUser);
router.patch(
  "/:id/toggle-login",
  // verifyJWT,
  // isAdmin,
  toggleUserLogin,
);

export default router;
