import express from "express";
import pool from "../db.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// GET /artists -> list all artists
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM artists ORDER BY id DESC");
    return res.json(rows);
  } catch (error) {
    console.error("GET /artists failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /artists/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query("SELECT * FROM artists WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Artist not found" });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error("GET /artists/:id failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /artists/:id/songs -> list all songs by a specific artist
router.get("/:id/songs", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT songs.id AS song_id,       songs.title,       albums.name AS album_name,       songs.release_date,       songs.link
      FROM songs
      JOIN albums ON songs.album_id = albums.ID
      WHERE songs.artist_id = $1
      ORDER BY songs.release_date DESC`,
      [id]
    );
    return res.json(rows);
  } catch (error) {
    console.error("GET /artists/:id/songs failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /artists -> create a new artist (auth required)
router.post("/", authenticateToken, async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "'name' is required" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO artists (name, posted_by_user_id) VALUES ($1, $2) RETURNING *",
      [name.trim(), userId]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("POST /artists failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// PATCH /artists/:id -> update an artist (auth required, owner only)
router.patch("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  if (name === undefined) {
    return res
      .status(400)
      .json({ error: "At least one field is required (name)" });
  }
  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    return res.status(400).json({ error: "'name' must be a non-empty string" });
  }

  try {
    // Check ownership
    const ownerCheck = await pool.query(
      "SELECT posted_by_user_id FROM artists WHERE id = $1",
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: "Artist not found" });
    }

    if (ownerCheck.rows[0].posted_by_user_id !== userId) {
      return res.status(403).json({
        error: "You do not have permission to modify this artist",
      });
    }

    const { rows } = await pool.query(
      "UPDATE artists SET name = $2 WHERE id = $1 RETURNING *",
      [id, name.trim()]
    );

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("PATCH /artists/:id failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /artists/:id -> delete an artist by id (auth required, owner only)
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check ownership
    const ownerCheck = await pool.query(
      "SELECT posted_by_user_id FROM artists WHERE id = $1",
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: "Artist not found" });
    }

    if (ownerCheck.rows[0].posted_by_user_id !== userId) {
      return res.status(403).json({
        error: "You do not have permission to delete this artist",
      });
    }

    // Check if artist has associated songs
    const songCheck = await pool.query(
      "SELECT COUNT(*) as count FROM songs WHERE artist_id = $1",
      [id]
    );

    if (parseInt(songCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error:
          "Cannot delete artist with associated songs. Delete songs first.",
      });
    }

    const { rows } = await pool.query(
      "DELETE FROM artists WHERE id = $1 RETURNING *",
      [id]
    );

    return res.status(200).json({
      message: "Artist deleted successfully",
      artist: rows[0],
    });
  } catch (error) {
    console.error("DELETE /artists/:id failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
