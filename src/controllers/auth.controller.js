import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {User}  from "../models/User.model.js";
import { UserLogin } from "../models/userLogin.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

/* ============================================================
   🔑 TOKEN HELPERS
============================================================ */
// export const generateAccessToken = (user) => {
//   return jwt.sign(
//     {
//       id: user._id,
//       role: user.role,
//       branch: user.branch,
//     },
//     process.env.ACCESS_TOKEN_KEY,
//     { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
//   );
// };

// export const generateRefreshToken = (userId, deviceId) => {
//   return jwt.sign(
//     { id: userId, deviceId },
//     process.env.REFRESH_TOKEN_KEY,
//     { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
//   );
// };

/* ============================================================
   🔐 LOGIN USER
============================================================ */


export const loginUser = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ message: "Request body missing" });

    let { username, password, deviceId } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    username = username.toLowerCase();

    // Find user login record and populate user details
    const login = await UserLogin.findOne({ username: new RegExp(`^${username}$`, 'i') })
      .select("+password")
      .populate("user");

    if (!login || !login.user) {
      return res.status(401).json({ message: "Invalid credentials anmfba" });
    }

    const user = login.user;

    if (!user.isActive || !user.canLogin) {
      return res.status(403).json({ message: "User not allowed to login" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, login.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user._id, deviceId || "default");

    // Update login info
    login.isLoggedIn = true;
    user.lastLogin = new Date();

    await login.save();
    await user.save();

    // Set refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        branch: user.branch || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


/* ============================================================
   ♻️ REFRESH ACCESS TOKEN
============================================================ */
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token missing" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_KEY
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

/* ============================================================
   🚪 LOGOUT USER
============================================================ */
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("refreshToken");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
