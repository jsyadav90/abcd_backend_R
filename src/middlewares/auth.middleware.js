//todo cookie-based auth
//todo access token verify
//todo enterprise ready

// import jwt from "jsonwebtoken";
// export const authenticate = (req, res, next) => {
//   const token = req.cookies?.accessToken;
//   if (!token) {
//     return res.status(401).json({ message: "Not authenticated" });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };


import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);

    const user = await User.findById(decoded.id).select(
      "_id role branch"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      branch: user.branch,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};
