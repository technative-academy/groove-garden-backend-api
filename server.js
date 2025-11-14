import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import routes from "./src/routes.js";

const app = express();
const port = process.env.PORT || 4000;

// OpenAPI config
const swaggerDocument = YAML.load("./openapi.yaml");

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Define CORS options to allow requests from the specified origin and include credentials
// This is crucial when using HTTP cookies for authentication, as cookies are not shared across domains by default
// Includes credentials (such as cookies) in requests and responses
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });
app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
