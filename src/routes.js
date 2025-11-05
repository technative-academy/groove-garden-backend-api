import express from "express";

import authRoutes from "./routes/auth.js";
import thingsRoutes from "./routes/things.js";
import usersRoutes from "./routes/users.js";
import myThingsRoutes from "./routes/my-things.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/things", thingsRoutes);
router.use("/users", usersRoutes);
router.use("/my-things", myThingsRoutes);

export default router;
