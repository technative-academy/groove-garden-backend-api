import express from "express";
import pool from "../db.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM playlists");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/my_playlists", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      "SELECT * FROM playlists WHERE created_by_user_id = $1",
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT
        *
      FROM
        playlists
      WHERE playlists.id = $1
      `,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Thing not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO playlists (title, description, created_by_user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description || "None", userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/add_to_playlist", authenticateToken, async (req, res) => {
  const { playlist_id, song_id } = req.body;
  const userId = req.user.id;
  if (!playlist_id || !song_id) {
    return res
      .status(400)
      .json({ error: "playlist_id and song_id are required" });
  }
  try {
    const ownerCheck = await pool.query(
      `SELECT created_by_user_id 
       FROM playlists 
       WHERE id = $1`,
      [playlist_id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    if (ownerCheck.rows[0].created_by_user_id !== userId) {
      return res
        .status(403)
        .json({ error: "You do not have permission to modify this playlist" });
    }

    const result = await pool.query(
      `INSERT INTO playlist_song (playlist_id, song_id)
       VALUES ($1, $2)
       RETURNING *`,
      [playlist_id, song_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
export default router;
