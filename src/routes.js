import express from "express";
import playlistRoutes from "./routes/playlists.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import myThingsRoutes from "./routes/my-things.js";
import songsRoutes from "./routes/songs.js";
import artistsRoutes from "./routes/artists.js";
import albumsRoutes from "./routes/albums.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/songs", songsRoutes);
router.use("/playlists", playlistRoutes);
router.use("/artists", artistsRoutes);
router.use("/albums", albumsRoutes);
export default router;
