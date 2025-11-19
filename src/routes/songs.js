import express from "express";
import pool from "../db.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

/* CRUD
Create > POST
Read > GET
Update > PUT
Delete > DELETE
*/

// POST /songs ->
router.post("/", authenticateToken, async (req, res) => {
  try {
    let artistId = null;
    let albumId = null;

    const { songTitle, songReleaseDate, songLink, artistName, albumName } =
      req.body;

    // check if artist name exists in the artist table. If it exists, retrieve the artists.name for storage
    // If its a new artist, insert the artist name in the artists table and then use the artist name for storage

    // query - check artists exists
    const checkArtistExists = await pool.query(
      `
      select artists.name as artist_name
      from artists
      where artists.name = $1
      `,
      [artistName]
    );

    /* artist does not exists */

    if (checkArtistExists.rows.length === 0) {
      // create new artist
      const addNewArtist = await pool.query(
        `
        INSERT INTO artists (name)
        VALUES ($1);
        `,
        [artistName]
      );

      // get newly added artist's id
      const newlyAddedArtistId = await pool.query(
        `
        SELECT artists.id FROM artists 
        WHERE artists.name = $1
        `,
        [artistName]
      );

      artistId = newlyAddedArtistId.rows[0].id;

      // // store details into songs table
      // const saveSongDetails = await pool.query(
      //   `
      //   INSERT INTO songs (title, $1, )
      //   VALUES ($1);
      //   `,
      //   [newlyAddedArtistId]
      // );

      // return res.status(404).json({ error: "Thing not found" });
    } else {
      const getArtistId = await pool.query(
        `
        SELECT artists.id FROM artists 
        WHERE artists.name = $1
        `,
        [artistName]
      );
      artistId = getArtistId.rows[0].id;
    }

    // query - check album exists
    const checkAlbumExists = await pool.query(
      `
      select albums.name from albums
      where albums.name = $1
      `,
      [albumName]
    );

    /* album does not exists */

    if (checkAlbumExists.rows.length === 0) {
      // create new album
      const addNewAlbum = await pool.query(
        `
        INSERT INTO albums (name)
        VALUES ($1);
        `,
        [albumName]
      );

      // get newly added album's id
      const newlyAddedAlbumId = await pool.query(
        `
        SELECT ALBUMS.ID FROM ALBUMS 
        WHERE ALBUMS.NAME = $1
        `,
        [albumName]
      );

      albumId = newlyAddedAlbumId.rows[0].id;

      // return res.status(404).json({ error: "Thing not found" });
    } else {
      const getAlbumId = await pool.query(
        `
        SELECT ALBUMS.ID FROM ALBUMS
        WHERE ALBUMS.NAME = $1
        `,
        [albumName]
      );

      albumId = getAlbumId.rows[0].id;
    }

    // const result = await pool.query(``);
    // res.json(result.rows);

    //    const { songTitle, songReleaseDate, songLink, artistName, albumName } =

    const storeSongDetails = await pool.query(
      `
        INSERT INTO songs (title,artist_id,album_id,release_date,link)
        VALUES ($1,$2,$3,$4,$5) RETURNING id,title,artist_id,album_id,release_date,link
        `,
      [songTitle, artistId, albumId, songReleaseDate, songLink]
    );

    // return res.status(201).json(storeSongDetails.rows[0]);
    return res.status(201).json(storeSongDetails.rows);
  } catch (error) {
    // res.status(500).json({ error: "Internal Server Error" });
    res.status(500).json({ error: error });
  }
});

// GET /songs -> list all songs
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT songs.id AS song_id,
             songs.title AS song_name,
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

// GET /songs/:songTitle -> list specific song with this name
router.get("/search", async (req, res) => {
  const { songTitle } = req.query;
  try {
    const result = await pool.query(
      `SELECT  songs.title AS song_name,  artists.name AS artist_name,  albums.name AS album_name,  songs.release_date,  songs.link 
      FROM songs 
      JOIN artists ON songs.artist_id = artists.id 
      JOIN albums ON songs.album_id = albums.id 
      WHERE songs.title = $1;`,
      [songTitle]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PATCH /songs/:songId -> update specific song with this name
router.patch("/:songId", async (req, res) => {
  try {
    let artistId = null;
    let albumId = null;

    const { songTitle, songReleaseDate, songLink, artistName, albumName } =
      req.body;

    // check if artist name exists in the artist table. If it exists, retrieve the artists.name for storage
    // If its a new artist, insert the artist name in the artists table and then use the artist name for storage

    // query - check artists exists
    const checkArtistExists = await pool.query(
      `
      select artists.name as artist_name
      from artists
      where artists.name = $1
      `,
      [artistName]
    );

    /* artist does not exists */

    if (checkArtistExists.rows.length === 0) {
      // create new artist
      const addNewArtist = await pool.query(
        `
        INSERT INTO artists (name)
        VALUES ($1);
        `,
        [artistName]
      );

      // get newly added artist's id
      const newlyAddedArtistId = await pool.query(
        `
        SELECT artists.id FROM artists 
        WHERE artists.name = $1
        `,
        [artistName]
      );

      artistId = newlyAddedArtistId.rows[0].id;

      // // store details into songs table
      // const saveSongDetails = await pool.query(
      //   `
      //   INSERT INTO songs (title, $1, )
      //   VALUES ($1);
      //   `,
      //   [newlyAddedArtistId]
      // );

      // return res.status(404).json({ error: "Thing not found" });
    } else {
      const getArtistId = await pool.query(
        `
        SELECT artists.id FROM artists 
        WHERE artists.name = $1
        `,
        [artistName]
      );
      artistId = getArtistId.rows[0].id;
    }

    // query - check album exists
    const checkAlbumExists = await pool.query(
      `
      select albums.name from albums
      where albums.name = $1
      `,
      [albumName]
    );

    /* album does not exists */

    if (checkAlbumExists.rows.length === 0) {
      // create new album
      const addNewAlbum = await pool.query(
        `
        INSERT INTO albums (name)
        VALUES ($1);
        `,
        [albumName]
      );

      // get newly added album's id
      const newlyAddedAlbumId = await pool.query(
        `
        SELECT ALBUMS.ID FROM ALBUMS 
        WHERE ALBUMS.NAME = $1
        `,
        [albumName]
      );

      albumId = newlyAddedAlbumId.rows[0].id;

      // return res.status(404).json({ error: "Thing not found" });
    } else {
      const getAlbumId = await pool.query(
        `
        SELECT ALBUMS.ID FROM ALBUMS
        WHERE ALBUMS.NAME = $1
        `,
        [albumName]
      );

      albumId = getAlbumId.rows[0].id;
    }

    // const result = await pool.query(``);
    // res.json(result.rows);

    //    const { songTitle, songReleaseDate, songLink, artistName, albumName } =

    const storeSongDetails = await pool.query(
      `UPDATE songs
      SET title = $1, column2 = value2, ...
      WHERE songs.id = $1;

        INSERT INTO songs (title,artist_id,album_id,release_date,link)
        VALUES ($1,$2,$3,$4,$5) RETURNING title,artist_id,album_id,release_date,link
        `,
      [songTitle, artistId, albumId, songReleaseDate, songLink]
    );

    // return res.status(201).json(storeSongDetails.rows[0]);
    return res.status(201).json(storeSongDetails.rows);
  } catch (error) {
    // res.status(500).json({ error: "Internal Server Error" });
    res.status(500).json({ error: error });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      "DELETE FROM songs WHERE id = $1 RETURNING *",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Artist not found" });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("DELETE /artists/:id failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
