import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

dotenv.config();

import routes from "./src/routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// OpenAPI config
const swaggerDocument = YAML.load("./openapi.yaml");

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Define CORS options to allow requests from the specified origin and include credentials
// This is crucial when using HTTP cookies for authentication, as cookies are not shared across domains by default
// Includes credentials (such as cookies) in requests and responses
const corsOptions = {
  origin: process.env.REACT_APP_DOMAIN,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
