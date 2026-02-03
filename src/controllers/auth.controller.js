import jwt from "jsonwebtoken";
import { UserLogin } from "../models/userLogin.model.js";

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

    const login = await UserLogin.findOne({
      username: username.toLowerCase(),
    }).populate("user");

    if (!login || !login.user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ❌ User inactive
    if (login.user.status !== "active") {
      return res.status(403).json({ message: "User is inactive" });
    }

    // ❌ Login disabled
    if (!login.canLogin) {
      return res.status(403).json({ message: "Login disabled by admin" });
    }

    const isMatch = await login.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      {
        id: login.user._id,
        role: login.user.role,
        branch: login.user.branch,
      },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: "1h" },
    );

    // 🍪 SET COOKIE
    res.cookie("accessToken", accessToken, {
      httpOnly: true, // JS cannot read it (security)
      sameSite: "lax", // good for ERP
      secure: false, // true in production (HTTPS)
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // RESPONSE (no token in body)
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: login.user._id,
        name: login.user.name,
        role: login.user.role,
        branch: login.user.branch,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Login failed" });
  }
};


export const logoutUser = (req, res) => {
  res.clearCookie("accessToken");
  return res.status(200).json({ message: "Logged out" });
};