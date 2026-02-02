import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
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
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ==============================
// PASSWORD HASH (CRITICAL FIX)
// ==============================
// userLoginSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

userLoginSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userLoginSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
  
});
// userLoginSchema.pre("save", async function (next) {
//   try {
//     if (this.isModified("password")) {
//       this.password = await bcrypt.hash(this.password, 10);
//     }
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// ==============================
// PASSWORD COMPARE
// ==============================
userLoginSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ==============================
// TOKEN GENERATORS
// ==============================
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
  await this.save();
  return token;
};

export const UserLogin = mongoose.model("UserLogin", userLoginSchema);
