// Features

      // login

      // refresh token rotation

      // cookie-based auth

      // logout (single device)

      // logout all devices

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserLogin } from "../models/userLogin.model.js";
import { User } from "../models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/token.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

// LOGIN
/* ================= LOGIN ================= */
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Credentials required" });
  }

  const loginDoc = await UserLogin.findOne({ username }).populate("user");
  if (!loginDoc || !loginDoc.user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, loginDoc.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!loginDoc.user.canLogin) {
    return res.status(403).json({ message: "Login disabled" });
  }

  const accessToken = generateAccessToken(loginDoc.user);
  const refreshToken = generateRefreshToken(loginDoc.user._id);

  loginDoc.refreshTokens.push({
    token: hashToken(refreshToken),
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

  await loginDoc.save();

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 5 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: "Login successful",
    user: {
      id: loginDoc.user._id,
      role: loginDoc.user.role,
      branch: loginDoc.user.branch,
    },
  });
};

// REFRESH TOKEN
/* ================= REFRESH ================= */
export const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No token" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const loginDoc = await UserLogin.findOne({ user: decoded.id }).populate("user");
  if (!loginDoc) return res.status(401).json({ message: "User not found" });

  const hashed = hashToken(token);
  const exists = loginDoc.refreshTokens.find(t => t.token === hashed);

  if (!exists) {
    loginDoc.refreshTokens = [];
    await loginDoc.save();
    return res.status(401).json({ message: "Session compromised" });
  }

  loginDoc.refreshTokens = loginDoc.refreshTokens.filter(
    t => t.token !== hashed
  );

  const newRefresh = generateRefreshToken(loginDoc.user._id);
  loginDoc.refreshTokens.push({
    token: hashToken(newRefresh),
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

  await loginDoc.save();

  const newAccess = generateAccessToken(loginDoc.user);

  res.cookie("accessToken", newAccess, {
    ...cookieOptions,
    maxAge: 5 * 60 * 1000,
  });

  res.cookie("refreshToken", newRefresh, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({ message: "Token refreshed" });
};

/* ================= LOGOUT (ONE DEVICE) ================= */
export const logoutUser = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await UserLogin.updateOne(
      { user: req.user.id },
      { $pull: { refreshTokens: { token: hashToken(token) } } }
    );
  }

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.json({ message: "Logged out" });
};

/* ================= LOGOUT ALL ================= */
export const logoutAllDevices = async (req, res) => {
  await UserLogin.updateOne(
    { user: req.user.id },
    { $set: { refreshTokens: [] } }
  );

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.json({ message: "Logged out from all devices" });
};

/* ================= ME ================= */
export const getMe = (req, res) => {
  res.json({
    id: req.user.id,
    role: req.user.role,
    branch: req.user.branch,
  });
};
