import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET /songs -> list all songs
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT songs.title AS song_name,
             artists.name AS artist_name,
             albums.name AS album_name,
             songs.release_date,
             songs.link
      FROM songs
      JOIN artists ON songs.artist_id = artists.id
      JOIN albums  ON songs.album_id  = albums.id
      ORDER BY songs.release_date DESC;
    `);
    return res.json(rows);
  } catch (error) {
    console.error("GET /songs failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /songs/:songName -> list specific song with this name
router.get("/:songName", async (req, res) => {
  const { songName } = req.params;
  try {
    const result = await pool.query(
      `SELECT  songs.title AS song_name,  artists.name AS artist_name,  albums.name AS album_name,  songs.release_date,  songs.link FROM songs JOIN artists ON songs.artist_id = artists.id JOIN albums ON songs.album_id = albums.id WHERE songs.id = $1;`,
      [songName]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Thing not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
