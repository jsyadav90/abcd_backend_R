import { UserLogin } from "../models/userLogin.model.js";
import { User } from "../models/user.model.js";

/* ================= ENABLE LOGIN ================= */
export const enableUserLogin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password required",
      });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "enterprise_admin") {
      return res.status(403).json({
        message: "Enterprise admin login cannot be modified",
      });
    }

    const existing = await UserLogin.findOne({
      $or: [{ user: user._id }, { username }],
    });

    if (existing) {
      return res.status(409).json({
        message: "Login already exists",
      });
    }

    await UserLogin.create({
      user: user._id,
      username: username.toLowerCase(),
      password,
    });

    user.canLogin = true;
    await user.save();

    res.status(201).json({
      message: "Login enabled successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DISABLE LOGIN ================= */
export const disableUserLogin = async (req, res) => {
  try {
    const { id } = req.params;

    await UserLogin.findOneAndDelete({ user: id });
    await User.findByIdAndUpdate(id, { canLogin: false });

    res.json({ message: "Login disabled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
