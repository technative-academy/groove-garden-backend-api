import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import routes from "./src/routes.js";
import rateLimit from "express-rate-limit";
const app = express();
const port = process.env.PORT || 4000;
const domain = process.env.APP_DOMAIN;

// CORS must run BEFORE limiter
app.use(
  cors({
    origin: domain,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON & cookies BEFORE rate limiting
app.use(express.json());
app.use(cookieParser());

// Allow OPTIONS preflight through (very important)
app.options("*", cors({ origin: domain, credentials: true }));

// Now apply rate limiter AFTER cookies/cors
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000,
  limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});

// Skip rate-limiting OPTIONS
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return next();
  next();
});

app.use(limiter);

// Routes
app.use("/api", routes);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
