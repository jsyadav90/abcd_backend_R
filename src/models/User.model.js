import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    designation: {
      type: String,
      default: "NA",
    },
    department: {
      type: String,
      default: "NA",
    },
    phone_no: {
      type: String,
      default: "NA",
    },
    remarks: {
      type: String,
      default: "NA",
    },

    branch: {
      type: String,
      default: "BBGS",
    },

    role: {
      type: String,
      enum: ["user", "admin", "super_admin","enterprise_admin"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },

    canLogin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const User =  mongoose.models.User || mongoose.model("User", userSchema);
// export const User = mongoose.model("User", userSchema);
