import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const refreshTokenSchema = new Schema(
  {
    token: {
      type: String, // hashed refresh token
      required: true,
    },
    userAgent: String,
    ip: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 30, // 30 days (TTL index)
    },
    
  },
  { _id: false },
);

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
    },

    password: {
      type: String,
      required: true,
    },

    refreshTokens: [refreshTokenSchema], // 🔥 multi-session support
  },
  { timestamps: true },
);

// 🔐 Hash password
userLoginSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// 🔍 Compare password
userLoginSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export const UserLogin =
  mongoose.models.UserLogin || mongoose.model("UserLogin", userLoginSchema);
