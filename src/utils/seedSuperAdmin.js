import { User } from "../models/user.model.js";
import { UserLogin } from "../models/userLogin.model.js";

export const seedSuperAdmin = async () => {
  const existing = await User.findOne({ role: "enterprise_admin" });

  if (existing) {
    console.log("✅ enterprise admin already exists");
    return;
  }

  console.log("🌱 Creating super admin...");

  const user = await User.create({
    userId: process.env.SYSTEM_ADMIN_USERID,
    name: "Enterprise Admin",
    email: "e_admin@admin.com",
    role: "enterprise_admin",
    status: "active",
  });

  await UserLogin.create({
    user: user._id,
    username: process.env.SYSTEM_ADMIN_USERNAME,
    password: process.env.SYSTEM_ADMIN_PASSWORD, // plain
  });

  console.log("✅ enterprise admin created");
};
