import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserLogin } from "../models/userLogin.model.js";
import { User } from "../models/user.model.js";

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  const userLogin = await UserLogin.findOne({ username }).populate("user");
  if (!userLogin || !userLogin.canLogin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await userLogin.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = jwt.sign(
    {
      id: userLogin.user._id,
      role: userLogin.user.role,
      branch: userLogin.user.branch,
    },
    process.env.ACCESS_TOKEN_KEY,
    { expiresIn: "1m" }
  );

  const refreshToken = jwt.sign(
    { id: userLogin.user._id },
    process.env.REFRESH_TOKEN_KEY,
    { expiresIn: "7d" }
  );

  // 🔐 HASH refresh token before DB save
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  userLogin.refreshToken = hashedRefreshToken;
  await userLogin.save();

  // 🍪 Cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: "Login successful",
    user: {
      id: userLogin.user._id,
      name: userLogin.user.name,
      role: userLogin.user.role,
      branch: userLogin.user.branch,
    },
  });
};





export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // If refresh token exists, remove from DB
    if (refreshToken) {
      const hashedToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      await UserLogin.updateOne(
        { refreshToken: hashedToken },
        { $set: { refreshToken: null } }
      );
    }

    // Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Logout failed",
    });
  }
};




// import jwt from "jsonwebtoken";
// import crypto from "crypto";
// import { UserLogin } from "../models/userLogin.model.js";

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    // 1️⃣ Verify refresh token signature & expiry
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_KEY
    );

    // 2️⃣ Hash incoming refresh token
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // 3️⃣ Find token in DB (MOST IMPORTANT STEP)
    const userLogin = await UserLogin
      .findOne({
        user: decoded.id,
        refreshToken: hashedToken,
      })
      .populate("user");

    if (!userLogin || !userLogin.canLogin) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    // 4️⃣ Generate new access token
    const newAccessToken = jwt.sign(
      {
        id: userLogin.user._id,
        role: userLogin.user.role,
        branch: userLogin.user.branch,
      },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1m" }
    );

    // 🔁 (OPTIONAL BUT RECOMMENDED) Refresh token rotation
    const newRefreshToken = jwt.sign(
      { id: userLogin.user._id },
      process.env.REFRESH_TOKEN_KEY,
      { expiresIn: "7d" }
    );

    const newHashedRefreshToken = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    userLogin.refreshToken = newHashedRefreshToken;
    await userLogin.save();

    // 5️⃣ Set cookies
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Access token refreshed",
    });

  } catch (error) {
    console.error("REFRESH ERROR:", error.message);

    // 🚨 Clear cookies ONLY when refresh token is invalid
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
    }

    return res.status(401).json({
      message: "Refresh token expired",
    });
  }
};

