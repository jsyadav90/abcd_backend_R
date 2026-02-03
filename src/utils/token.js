import jwt from "jsonwebtoken";

export const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, branch: user.branch },
    process.env.ACCESS_TOKEN_KEY,
    // { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    { expiresIn: "5m" }
  );

export const generateRefreshToken = (userId) =>
  jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_KEY,
    { expiresIn: "7d" }
    // { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
