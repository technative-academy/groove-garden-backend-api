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

router.get("/:id", async (req, res) => {
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

router.post("/", async (req, res) => {
  const { playlist_id, song_id } = req.body;
  if (!playlist_id || !song_id) {
    return res
      .status(400)
      .json({ error: "playlist_id and song_id are required" });
  }
  const result = await pool.query(
    `INSERT INTO playlist_song (playlist_id, song_id)
       VALUES ($1, $2)
       RETURNING *`,
    [playlist_id, song_id]
  );
  try {
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
export default router;
