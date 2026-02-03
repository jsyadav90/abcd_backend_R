import jwt from "jsonwebtoken";

export const verifyAccessToken = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
