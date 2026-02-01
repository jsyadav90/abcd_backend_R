import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // <-- added
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <-- optional, for form data
app.use(cookieParser()); // <-- added

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
