import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    refreshToken: { type: String, select: false },
    isLoggedIn: { type: Boolean, default: false },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

//////////////////////////////
// Password Hash (FIXED)
//////////////////////////////
userLoginSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

//////////////////////////////
// Password Compare
//////////////////////////////
userLoginSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

//////////////////////////////
// Token Generators
//////////////////////////////
userLoginSchema.methods.generateAccessToken = function (user) {
  return jwt.sign(
    {
      id: user._id,
      username: this.username,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userLoginSchema.methods.generateRefreshToken = async function () {
  const token = jwt.sign(
    { id: this.user },
    process.env.REFRESH_TOKEN_KEY,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );

  this.refreshToken = token;
  await this.save(); // OK now
  return token;
};

export const UserLogin = mongoose.model("UserLogin", userLoginSchema);
