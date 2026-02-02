import {User} from "../models/User.model.js";
import bcrypt from "bcrypt";  

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};


// get single user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Create User 
import { UserLogin } from "../models/userLogin.model.js";

export const createUser = async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      role,
      status,
      designation,
      department,
      phone_no,
      remarks,
      canLogin,
      username,
      password,
    } = req.body;

    if (!userId || !name || !email) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const canLoginBool =
      canLogin === true || canLogin === "true" || canLogin === "yes";

    const existingUser = await User.findOne({
      $or: [{ userId }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with same ID or email already exists",
      });
    }

    if (canLoginBool) {
      if (!username || !password) {
        return res.status(400).json({
          message: "Username & password required for login user",
        });
      }

      const existingLogin = await UserLogin.findOne({
        username: username.toLowerCase(),
      });

      if (existingLogin) {
        return res.status(409).json({
          message: "Username already exists",
        });
      }
    }

    // 1️⃣ Create User
    const user = await User.create({
      userId,
      name,
      email,
      role,
      status,
      designation,
      department,
      phone_no,
      remarks,
      canLogin: canLoginBool,
    });

    // 2️⃣ Create UserLogin (NO manual bcrypt here)
    if (canLoginBool) {
      await UserLogin.create({
        user: user._id,
        username: username.toLowerCase(),
        password, // 👈 plain password (model will hash)
      });
    }

    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    return res.status(500).json({
      message: "User creation failed",
      error: error.message,
    });
  }
};




// Update single user
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" }); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const toggleUserLogin = async (req, res) => {
//   const user = await User.findById(req.params.id);

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   user.canLogin = !user.canLogin;
//   await user.save();

//   res.json({
//     message: user.canLogin
//       ? "User login enabled"
//       : "User login disabled",
//     canLogin: user.canLogin,
//   });
// };

export const toggleUserLogin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ Block if user is inactive
    if (user.status === "inactive") {
      return res.status(403).json({
        message: "Login cannot be changed for inactive user",
      });
    }

    user.canLogin = !user.canLogin;
    await user.save();

    res.json({
      message: user.canLogin
        ? "User login enabled"
        : "User login disabled",
      canLogin: user.canLogin,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update login status" });
  }
};
