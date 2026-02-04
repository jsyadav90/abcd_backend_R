import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const refreshTokenSchema = new Schema(
  {
    token: { type: String, required: true },
    userAgent: String,
    ip: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 30, // 30 days
    },
  },
  { _id: false }
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
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    refreshTokens: [refreshTokenSchema],
  },
  { timestamps: true }
);

// 🔐 hash password once
userLoginSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
  
});

// 🔍 compare password
userLoginSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

export const UserLogin =
  mongoose.models.UserLogin ||
  mongoose.model("UserLogin", userLoginSchema);
