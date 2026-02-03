import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userLoginSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    canLogin: {
      type: Boolean,
      default: true,
    },
     refreshToken: {
    type: String, // HASHED refresh token
    default: null,
  },
  },
  { timestamps: true }
);

// 🔐 Hash password
userLoginSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;
  this.password = await bcrypt.hash(this.password, 10);
 
});

// 🔍 Compare password
userLoginSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export const UserLogin =
  mongoose.models.UserLogin || mongoose.model("UserLogin", userLoginSchema);
