import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
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
    const { username, password } = req.body;

    // Fetch login record with password
    const loginRecord = await UserLogin.findOne({
      username: username.toLowerCase(),
    })
      .select("+password") // ✅ important
      .populate("user");

    if (!loginRecord) {
      return res.status(401).json({ message: "No record found" });
    }

    // Check if user can login
    if (!loginRecord.user.canLogin) {
      return res.status(403).json({ message: "Login disabled for this user" });
    }

    console.log("Password length:", loginRecord.password?.length);
    console.log(
      "Password starts with $2:",
      loginRecord.password?.startsWith("$2"),
    );
    console.log("Full password:", loginRecord.password); // Should be ~60 chars, start with $2b$ or $2a$
    // Compare passwords
    const isMatch = await bcrypt.compare(password, loginRecord.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: loginRecord.user._id, role: loginRecord.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: loginRecord.user._id,
        name: loginRecord.user.name,
        userId: loginRecord.user.userId,
        role: loginRecord.user.role,
        canLogin: loginRecord.user.canLogin,
        status: loginRecord.user.status,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

/* ============================================================
   ♻️ REFRESH ACCESS TOKEN
============================================================ */
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token missing" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);

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
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
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
