import express from "express";
import pool from "../db.js";

const router = express.Router();

/* CRUD
Create > POST
Read > GET
Update > PUT
Delete > DELETE
*/

// POST /songs ->
router.post("/", async (req, res) => {
  try {
    const { songTitle, songReleaseDate, songLink, artistName, albumName } =
      req.body;

    // check if artist name exists in the artist table. If it exists, retrieve the artists.name for storage
    // If its a new artist, insert the artist name in the artists table and then use the artist name for storage

    // query - check artists exists
    const checkArtistExists = await pool.query(
      `
      select artists.name as artist_name
      from artists
      where artists.id = $1
      `,
      [artistName]
    );

    // artist does not exists, create new artist
    if (checkArtistExists.rows.length === 0) {
      const addNewArtist = await pool.query(
        `
        insert into artists
        values ($1)
        `,
        [artistName]
      );
      // return res.status(404).json({ error: "Thing not found" });
    }

    const result = await pool.query(``);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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
      `SELECT  songs.title AS song_name,  artists.name AS artist_name,  albums.name AS album_name,  songs.release_date,  songs.link 
      FROM songs 
      JOIN artists ON songs.artist_id = artists.id 
      JOIN albums ON songs.album_id = albums.id 
      WHERE songs.title = $1;`,
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
