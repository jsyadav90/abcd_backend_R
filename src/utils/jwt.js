import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role, branch: user.branch },
    process.env.ACCESS_TOKEN_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

export const generateRefreshToken = (userId, deviceId) => {
  return jwt.sign(
    { id: userId, deviceId },
    process.env.REFRESH_TOKEN_KEY,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};
