import rateLimit from "express-rate-limit";

/**
 * Generic rate limiter factory
 * Reusable for any route
 */
const createRateLimiter = ({
  windowMs,
  max,
  message,
}) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // RateLimit-* headers
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
      });
    },
  });
};

/* ===============================
   AUTH RELATED LIMITERS
================================ */

// 🔐 Login attempts limiter
export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message:
    "Too many login attempts. Please try again after 15 minutes.",
});

// 🔁 Refresh token limiter
export const refreshTokenLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message:
    "Too many refresh requests. Please slow down.",
});

// 🚪 Logout limiter (optional but safe)
export const logoutLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message:
    "Too many logout requests.",
});
