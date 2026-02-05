// import express from "express";
// import {
//   getUsers,
//   deleteUser,
//   enableLogin,
//   disableLogin,
// } from "../controllers/user.controller.js";

// import { authenticate } from "../middlewares/auth.middleware.js";
// import { authorize } from "../middlewares/authorize.middleware.js";

// const router = express.Router();

// /* 🔐 Only admin & enterprise admin */
// router.get(
//   "/",
//   authenticate,
//   authorize("admin", "enterprise_admin"),
//   getUsers
// );

// /* 🔐 Only enterprise admin */
// router.delete(
//   "/:id",
//   authenticate,
//   authorize("enterprise_admin"),
//   deleteUser
// );

// /* 🔐 Admin + enterprise admin */
// router.post(
//   "/:id/enable-login",
//   authenticate,
//   authorize("admin", "enterprise_admin"),
//   enableLogin
// );

// router.post(
//   "/:id/disable-login",
//   authenticate,
//   authorize("admin", "enterprise_admin"),
//   disableLogin
// );

// export default router;




import express from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", authenticate, getUsers);

router.post(
  "/",
  authenticate,
  allowRoles("super_admin", "admin"),
  createUser
);

router.put(
  "/:id",
  authenticate,
  allowRoles("super_admin"),
  updateUser
);

router.delete(
  "/:id",
  authenticate,
  allowRoles("super_admin", "admin"),
  deleteUser
);

export default router;
