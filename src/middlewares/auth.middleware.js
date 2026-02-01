import jwt from "jsonwebtoken";

export const verifyAccessToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token missing" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      branch: decoded.branch,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};
