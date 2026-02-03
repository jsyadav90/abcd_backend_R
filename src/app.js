import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

/* ✅ CORS — MUST be before routes */
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,               // allow cookies
  })
);

/* ✅ Middlewares */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ✅ Routes */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
