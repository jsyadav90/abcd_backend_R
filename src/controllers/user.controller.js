import { User } from "../models/user.model.js";
import { UserLogin } from "../models/userLogin.model.js";

/* ================= GET USERS ================= */
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;

    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { userId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

//! ================= CREATE USER ================= */
// export const createUser = async (req, res) => {
//   try {
//     const {
//       userId,
//       name,
//       email,
//       role,
//       canLogin,
//       username,
//       password,
//     } = req.body;

//     if (!userId || !name || !email) {
//       return res.status(400).json({ message: "Required fields missing" });
//     }

//     if (role === "enterprise_admin") {
//       return res.status(403).json({
//         message: "Enterprise admin cannot be created",
//       });
//     }

//     const exists = await User.findOne({
//       $or: [{ userId }, { email }],
//     });

//     if (exists) {
//       return res.status(409).json({ message: "User already exists" });
//     }

//     const user = await User.create({
//       userId,
//       name,
//       email,
//       role,
//       canLogin: !!canLogin,
//     });

//     if (canLogin) {
//       if (!username || !password) {
//         return res.status(400).json({
//           message: "Username and password required",
//         });
//       }

//       await UserLogin.create({
//         user: user._id,
//         username: username.toLowerCase(),
//         password,
//       });
//     }

//     res.status(201).json({
//       message: "User created successfully",
//       user,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


export const createUser = async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      role,
      designation,
      department,
      phone_no,
      remarks,
      status,
    } = req.body;

    if (!userId || !name || !email) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (role === "enterprise_admin") {
      return res.status(403).json({
        message: "Enterprise admin cannot be created manually",
      });
    }

    const exists = await User.findOne({
      $or: [{ userId }, { email }],
    });

    if (exists) {
      return res.status(409).json({
        message: "User with same ID or email already exists",
      });
    }

    const user = await User.create({
      userId,
      name,
      email,
      role,
      designation,
      department,
      phone_no,
      remarks,
      status,
      canLogin: false,
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* ================= UPDATE USER ================= */
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id === userId) {
      return res.status(403).json({
        message: "You cannot edit your own role",
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "enterprise_admin") {
      return res.status(403).json({
        message: "Enterprise admin cannot be modified",
      });
    }

    Object.assign(user, req.body);
    await user.save();

    res.json({ message: "User updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE USER ================= */
// export const deleteUser = async (req, res) => {
//   try {
//     const targetId = req.params.id;

//     if (req.user.id === targetId) {
//       return res.status(403).json({
//         message: "You cannot delete your own account",
//       });
//     }

//     const user = await User.findById(targetId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.role === "enterprise_admin") {
//       return res.status(403).json({
//         message: "Enterprise admin cannot be deleted",
//       });
//     }

//     if (
//       req.user.role === "admin" &&
//       user.role !== "user"
//     ) {
//       return res.status(403).json({
//         message: "Admin cannot delete admin users",
//       });
//     }

//     await UserLogin.findOneAndDelete({ user: user._id });
//     await User.findByIdAndDelete(user._id);

//     res.json({ message: "User deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


export const deleteUser = async (req, res) => {
  try {
    const targetId = req.params.id;

    if (req.user.id === targetId) {
      return res.status(403).json({
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "enterprise_admin") {
      return res.status(403).json({
        message: "Enterprise admin cannot be deleted",
      });
    }

    await UserLogin.findOneAndDelete({ user: user._id });
    await User.findByIdAndDelete(user._id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};