// import dotenv from "dotenv";
// import app from "./app.js";
// import connectDB from "./config/db.js";

// dotenv.config();

// connectDB();

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import { seedSuperAdmin } from "./utils/seedSuperAdmin.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");

    // 🔥 VERY IMPORTANT
    await seedSuperAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed", err);
  });
