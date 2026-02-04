import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedSuperAdmin } from "./src/utils/seedSuperAdmin.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

await seedSuperAdmin();

console.log("🌱 Seeding finished");
process.exit();
