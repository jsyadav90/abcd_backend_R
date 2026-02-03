import jwt from "jsonwebtoken";
import { UserLogin } from "../models/userLogin.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/token.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
  path: "/",
};

/* ================= LOGIN ================= */
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  const login = await UserLogin.findOne({ username }).populate("user");
  if (!login || !(await login.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = generateAccessToken(login.user);
  const refreshToken = generateRefreshToken(login.user._id);

  login.refreshTokens.push({
    token: hashToken(refreshToken),
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

  await login.save();

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 5 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ message: "Login successful" });
};

/* ================= REFRESH ================= */
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_KEY
    );

    const hashed = hashToken(refreshToken);

    const login = await UserLogin.findOne({ user: decoded.id }).populate("user");
    if (!login) throw new Error("User not found");

    const tokenExists = login.refreshTokens.find(
      (t) => t.token === hashed
    );

    // 🚨 TOKEN REUSE DETECTED
    if (!tokenExists) {
      login.refreshTokens = []; // revoke all
      await login.save();

      res.clearCookie("accessToken", cookieOptions);
      res.clearCookie("refreshToken", cookieOptions);

      return res.status(401).json({
        message: "Security alert: session revoked",
      });
    }

    // 🔁 ROTATE TOKEN
    login.refreshTokens = login.refreshTokens.filter(
      (t) => t.token !== hashed
    );

    const newAccess = generateAccessToken(login.user);
    const newRefresh = generateRefreshToken(login.user._id);

    login.refreshTokens.push({
      token: hashToken(newRefresh),
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    await login.save();

    res.cookie("accessToken", newAccess, {
      ...cookieOptions,
      maxAge: 5 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefresh, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Token refreshed" });
  } catch (err) {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    res.status(401).json({ message: "Session expired" });
  }
};

/* ================= LOGOUT (ONE DEVICE) ================= */
export const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await UserLogin.updateOne(
      {},
      { $pull: { refreshTokens: { token: hashToken(refreshToken) } } }
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

export const getLoggedInDevices = async (req, res) => {
  try {
    const login = await UserLogin.findOne({ user: req.user.id });

    if (!login) {
      return res.status(404).json({ message: "User not found" });
    }

    const devices = login.refreshTokens.map((t, index) => ({
      id: index + 1,
      loggedInAt: t.createdAt,
      device: t.userAgent,
      ip: t.ip,
    }));

    return res.status(200).json({
      totalDevices: devices.length,
      devices,
    });
  } catch (error) {
    console.error("DEVICE LIST ERROR:", error.message);
    return res.status(500).json({ message: "Failed to fetch devices" });
  }
};


export const getCsrfToken = (req, res) => {
  res.status(200).json({
    csrfToken: req.csrfToken(),
  });
};
