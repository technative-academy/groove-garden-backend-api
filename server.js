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

app.options("*", cors({ origin: domain, credentials: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000,
  limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Skip rate-limiting OPTIONS
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return next();
  next();
});

app.use(
  cors({
    origin: domain,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(limiter);

// OpenAPI config
const swaggerDocument = YAML.load("./docs/openapi.yaml");
app.set("trust proxy", 1);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
