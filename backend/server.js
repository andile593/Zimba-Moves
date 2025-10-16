require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const session = require('express-session');
const passport = require('./config/passport');
const errorHandler = require("./middleware/errorHandler");
const { authenticate } = require("./middleware/auth");

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(morgan("combined"));
app.use(express.json());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    validate: {
      xForwardedForHeader: false,
      trustProxy: false,
    },
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());    require('node:crypto').randomBytes(32).toString('hex')
app.use(passport.session());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Public routes
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/pages"));

// Provider routes - mix of public and protected
app.use("/providers", require("./routes/provider"));

// Quote routes - distance calculation is public, rest are protected
const quoteRoutes = require("./routes/quote");
app.use("/quotes", quoteRoutes);

// Protected routes
app.use("/bookings", authenticate, require("./routes/booking"));
app.use("/complaints", authenticate, require("./routes/complaint"));
app.use("/admin", authenticate, require("./routes/admin"));
app.use("/payments", authenticate, require("./routes/payments"));

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
