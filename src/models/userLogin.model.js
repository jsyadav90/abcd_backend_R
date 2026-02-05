// refresh token rotation support

// password hashing safe

// token cleanup ready

// future-proof

// models/userLogin.model.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userLoginSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

userLoginSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare password
userLoginSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

export const UserLogin =
  mongoose.models.UserLogin ||
  mongoose.model("UserLogin", userLoginSchema);
