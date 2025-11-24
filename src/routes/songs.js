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
    let userId = req.user.id;

    const { songTitle, artistName, albumName, releaseDate, link } = req.body;

    // check if artist name exists in the artist table. If it exists, retrieve the artists.name for storage
    // If its a new artist, insert the artist name in the artists table and then use the artist name for storage

    //check song exists
    const checkSongExists = await pool.query(
      `
      select songs.title as song_title
      from songs
      where songs.title = $1
      `,
      [songTitle]
    );

    // query - check artists exists
    const checkArtistExists = await pool.query(
      `
      select artists.name as artist_name
      from artists
      where artists.name = $1
      `,
      [artistName]
    );

    // if song exists, and artist exists return error
    if (checkSongExists.rows.length > 0 && checkArtistExists.rows.length > 0) {
      return res.status(400).json({ error: "Song already exists" });
    }

    /* artist does not exist */

    if (checkArtistExists.rows.length === 0) {
      // create new artist
      const addNewArtist = await pool.query(
        `
        INSERT INTO artists (name, posted_by_user_id)
        VALUES ($1, $2);
        `,
        [artistName, userId]
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
        INSERT INTO albums (name, posted_by_user_id)
        VALUES ($1, $2);
        `,
        [albumName, userId]
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


    const storeSongDetails = await pool.query(
      `
        INSERT INTO songs (title,artist_id,album_id,release_date,link, posted_by_user_id)
        VALUES ($1,$2,$3,$4,$5) RETURNING id,title,artist_id,album_id,release_date,link, posted_by_user_id
        `,
      [songTitle, artistId, albumId, releaseDate, link, userId]
    );

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
             songs.link,
             songs.posted_by_user_id
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

// GET /songs?songTitle=... -> list specific songs with this name
router.get("/search", async (req, res) => {
  const { songTitle } = req.query;
  try {
    const result = await pool.query(
      `SELECT songs.title AS song_name,  
              artists.name AS artist_name,  
              albums.name AS album_name,  songs.release_date,  
              songs.link , 
              songs.posted_by_user_id
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

// PATCH /songs/:songId -> Update a specific song
router.patch("/:songId", authenticateToken, async (req, res) => {
  const { songId } = req.params;
  const userId = req.user.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if song exists and user has permission
    const ownerCheck = await client.query(
      `SELECT posted_by_user_id FROM songs WHERE id = $1`,
      [songId]
    );

    if (ownerCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Song not found" });
    }

    if (ownerCheck.rows[0].posted_by_user_id !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ 
        error: "You do not have permission to modify this song" 
      });
    }

    const { songTitle, artistName, albumName, releaseDate, link } = req.body;

    // Handle artist if provided
    let artistId;
    if (artistName) {
      const existingArtist = await client.query(
        `SELECT id FROM artists WHERE name = $1`,
        [artistName]
      );

      if (existingArtist.rows.length === 0) {
        const newArtist = await client.query(
          `INSERT INTO artists (name, posted_by_user_id)
           VALUES ($1, $2) RETURNING id`,
          [artistName, userId]
        );
        artistId = newArtist.rows[0].id;
      } else {
        artistId = existingArtist.rows[0].id;
      }
    }

    // Handle album if provided
    let albumId;
    if (albumName) {
      const existingAlbum = await client.query(
        `SELECT id FROM albums WHERE name = $1`,
        [albumName]
      );

      if (existingAlbum.rows.length === 0) {
        const newAlbum = await client.query(
          `INSERT INTO albums (name, posted_by_user_id)
           VALUES ($1, $2) RETURNING id`,
          [albumName, userId]
        );
        albumId = newAlbum.rows[0].id;
      } else {
        albumId = existingAlbum.rows[0].id;
      }
    }

    // Build dynamic UPDATE query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (songTitle) {
      updates.push(`title = $${paramCount++}`);
      values.push(songTitle);
    }
    if (artistId) {
      updates.push(`artist_id = $${paramCount++}`);
      values.push(artistId);
    }
    if (albumId) {
      updates.push(`album_id = $${paramCount++}`);
      values.push(albumId);
    }
    if (releaseDate) {
      updates.push(`release_date = $${paramCount++}`);
      values.push(releaseDate);
    }
    if (link) {
      updates.push(`link = $${paramCount++}`);
      values.push(link);
    }

    if (updates.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(songId);
    const updateQuery = `
      UPDATE songs
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, title, artist_id, album_id, release_date, link, posted_by_user_id
    `;

    const result = await client.query(updateQuery, values);
    await client.query('COMMIT');

    return res.status(200).json(result.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("PATCH /songs/:songId failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; 

  try {
    // Check if song exists and user has permission
    const ownerCheck = await pool.query(
      `SELECT posted_by_user_id 
       FROM songs 
       WHERE id = $1`,
      [id] 
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: "Song not found" });
    }

    if (ownerCheck.rows[0].posted_by_user_id !== userId) {
      return res.status(403).json({ 
        error: "You do not have permission to delete this song" 
      });
    }

    // Delete the song
    const { rows } = await pool.query(
      "DELETE FROM songs WHERE id = $1 RETURNING *",
      [id]
    );

    return res.status(200).json({ 
      message: "Song deleted successfully",
      song: rows[0] 
    });

  } catch (error) {
    console.error("DELETE /songs/:id failed:", error); // Fixed: reference songs not artists
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
