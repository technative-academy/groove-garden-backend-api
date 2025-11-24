import express from "express";
import pool from "../db.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// GET /albums -> list all albums (with optional artist name)
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.id,
             a.name,
             a.artist_id,
             a.release_date,
             a.posted_by_user_id,
             ar.name AS artist_name
      FROM albums a
      LEFT JOIN artists ar ON a.artist_id = ar.id
      ORDER BY a.id DESC
    `);
    return res.json(rows);
  } catch (error) {
    console.error("GET /albums failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /albums -> create a new album (auth required)
router.post("/", authenticateToken, async (req, res) => {
  const { name, artist_id, release_date } = req.body;
  const userId = req.user.id;

  // Basic validation
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "'name' is required" });
  }
  if (artist_id !== undefined && !Number.isInteger(artist_id)) {
    return res
      .status(400)
      .json({ error: "'artist_id' must be an integer if provided" });
  }
  if (
    release_date !== undefined &&
    (typeof release_date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(release_date))
  ) {
    return res.status(400).json({
      error: "'release_date' must be a string in format YYYY-MM-DD if provided",
    });
  }

  try {
    // Check if album already exists
    const existing = await pool.query(
      "SELECT id FROM albums WHERE name = $1 AND artist_id = $2",
      [name.trim(), artist_id ?? null]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Album already exists" });
    }

    // Verify artist exists if artist_id is provided
    if (artist_id) {
      const artistCheck = await pool.query(
        "SELECT id FROM artists WHERE id = $1",
        [artist_id]
      );

      if (artistCheck.rows.length === 0) {
        return res.status(400).json({ error: "Artist not found" });
      }
    }

    const { rows } = await pool.query(
      "INSERT INTO albums (name, artist_id, release_date, posted_by_user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name.trim(), artist_id ?? null, release_date ?? null, userId]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("POST /albums failed:", error);
    // If DB rejects casting release_date to date, surface as 400
    if (error && error.code === "22007") {
      return res.status(400).json({ error: "Invalid 'release_date' value" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /albums/:id -> fetch a single album (with optional artist name)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT a.id,
              a.name,
              a.artist_id,
              a.release_date,
              a.posted_by_user_id,
              ar.name AS artist_name
       FROM albums a
       LEFT JOIN artists ar ON a.artist_id = ar.id
       WHERE a.id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Album not found" });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error("GET /albums/:id failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /albums/:id/songs -> list all songs in a specific album
router.get("/:id/songs", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT songs.id AS song_id, 
              songs.title, 
              artists.name AS artist_name, 
              songs.release_date, 
              songs.link,
              songs.posted_by_user_id
       FROM songs
       JOIN artists ON songs.artist_id = artists.id
       WHERE songs.album_id = $1
       ORDER BY songs.release_date DESC`,
      [id]
    );
    return res.json(rows);
  } catch (error) {
    console.error("GET /albums/:id/songs failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// PATCH /albums/:id -> update album fields (auth required, owner only)
router.patch("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, artist_id, release_date } = req.body;
  const userId = req.user.id;

  try {
    // Check ownership
    const ownerCheck = await pool.query(
      "SELECT posted_by_user_id FROM albums WHERE id = $1",
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: "Album not found" });
    }

    if (ownerCheck.rows[0].posted_by_user_id !== userId) {
      return res.status(403).json({
        error: "You do not have permission to modify this album",
      });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res
          .status(400)
          .json({ error: "'name' must be a non-empty string" });
      }
      updates.push(`name = $${updates.length + 1}`);
      values.push(name.trim());
    }

    if (artist_id !== undefined) {
      if (!Number.isInteger(artist_id)) {
        return res
          .status(400)
          .json({ error: "'artist_id' must be an integer if provided" });
      }

      // Verify artist exists
      const artistCheck = await pool.query(
        "SELECT id FROM artists WHERE id = $1",
        [artist_id]
      );

      if (artistCheck.rows.length === 0) {
        return res.status(400).json({ error: "Artist not found" });
      }

      updates.push(`artist_id = $${updates.length + 1}`);
      values.push(artist_id);
    }

    if (release_date !== undefined) {
      if (
        typeof release_date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(release_date)
      ) {
        return res.status(400).json({
          error:
            "'release_date' must be a string in format YYYY-MM-DD if provided",
        });
      }
      updates.push(`release_date = $${updates.length + 1}`);
      values.push(release_date);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one field must be provided to update" });
    }

    const query = `UPDATE albums SET ${updates.join(", ")} WHERE id = $${updates.length + 1} RETURNING *`;
    const { rows } = await pool.query(query, [...values, id]);

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("PATCH /albums/:id failed:", error);
    if (error && error.code === "22007") {
      return res.status(400).json({ error: "Invalid 'release_date' value" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /albums/:id -> delete an album by id (auth required, owner only)
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check ownership
    const ownerCheck = await pool.query(
      "SELECT posted_by_user_id FROM albums WHERE id = $1",
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: "Album not found" });
    }

    if (ownerCheck.rows[0].posted_by_user_id !== userId) {
      return res.status(403).json({
        error: "You do not have permission to delete this album",
      });
    }

    // Check if album has associated songs
    const songCheck = await pool.query(
      "SELECT COUNT(*) as count FROM songs WHERE album_id = $1",
      [id]
    );

    if (parseInt(songCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: "Cannot delete album with associated songs. Delete songs first.",
      });
    }

    const { rows } = await pool.query(
      "DELETE FROM albums WHERE id = $1 RETURNING *",
      [id]
    );

    return res.status(200).json({
      message: "Album deleted successfully",
      album: rows[0],
    });
  } catch (error) {
    console.error("DELETE /albums/:id failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
