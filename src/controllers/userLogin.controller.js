import { UserLogin } from "../models/userLogin.model.js"; 
import { User } from "../models/user.model.js";

export const enableUserLogin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.userId) {
      return res.status(400).json({ message: "UserId missing" });
    }

    const existingLogin = await UserLogin.findOne({ user: user._id });
    if (existingLogin) {
      return res.status(400).json({ message: "Login already enabled" });
    }

    const loginUser = await UserLogin.create({
      user: user._id,
      username: user.userId.toLowerCase(),
      password: "welcome123".trim(),
    });

    user.canLogin = true;
    await user.save();

    res.status(201).json({
      message: "Login enabled",
      username: loginUser.username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

