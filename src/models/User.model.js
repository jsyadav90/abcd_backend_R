import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    designation:{type: String, default : "NA"},
    department:{type: String, default : "NA"},
    phone_no:{type: String, default : "NA"},
    remarks:{type: String, default : "NA"},
    role: {
      type: String,
      enum: ["user", "admin", "super_admin"],
      default: "user",
    },
    status:{
      type: String,
      enum: ["Active", "Inactive",],
      default: "Inactive",
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
