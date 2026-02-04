import {User} from "../models/user.model.js";
// import { User } from "../models/user.model.js";
import { UserLogin } from "../models/userLogin.model.js";

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
// import { UserLogin } from "../models/userLogin.model.js";

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
// export const deleteUser = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     // 1. Find user first
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (req.user.id === req.params.id) {
//   return res.status(403).json({
//     message: "You cannot delete your own account",
//   });
// }

//     // 2. Prevent super admin deletion
//     if (user.role === "enterprise_admin") {
//       return res.status(403).json({
//         message: "System super admin cannot be deleted",
//       });
//     }

//     // 3. Delete user login using user reference
//     await UserLogin.findOneAndDelete({ user: userId });

//     // 4. Delete user
//     await User.findByIdAndDelete(userId);

//     res.json({ message: "User deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const deleteUser = async (req, res) => {
  try {
    // auth guard
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.params.id;

    // prevent self delete
    if (req.user.id.toString() === userId.toString()) {
      return res.status(403).json({
        message: "You cannot delete your own account",
      });
    }

    // find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // prevent enterprise admin deletion
    if (user.role === "enterprise_admin") {
      return res.status(403).json({
        message: "Enterprise admin cannot be deleted",
      });
    }

    // delete related login
    await UserLogin.findOneAndDelete({ user: user._id });

    // delete user
    await User.findByIdAndDelete(user._id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};




export const toggleUserLogin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const login = await UserLogin.findOne({ user: user._id });

    if (login) {
      await login.deleteOne();
      user.canLogin = false;
      await user.save();
      return res.json({ message: "Login disabled" });
    }

    const newLogin = await UserLogin.create({
      user: user._id,
      username: user.userId.toLowerCase(),
      password: "welcome@123",
      canLogin: true,
    });

    user.canLogin = true;
    await user.save();

    res.status(201).json({
      message: "Login enabled",
      username: newLogin.username,
      defaultPassword: "welcome@123",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Toggle login failed" });
  }
};


