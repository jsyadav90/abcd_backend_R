import csrf from "csurf";

export const csrfProtection = csrf({
  cookie: {
    httpOnly: false, // frontend must read it
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  },
});
