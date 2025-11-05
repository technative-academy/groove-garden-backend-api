import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET /songs -> list all songs
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        songs.title AS song_name,
        artists.name AS artist_name,
        albums.name AS album_name,
        songs.release_date,
        songs.link
      FROM songs
      JOIN artists ON songs.artist_id = artists.id
      JOIN albums ON songs.album_id = albums.id
      ORDER BY songs.release_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /songs/:id -> list specific song with this id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT
        
      FROM
        songs 
      WHERE
        songs.id = $1
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

export default router;
