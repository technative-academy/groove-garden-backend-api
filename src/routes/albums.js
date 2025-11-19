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
    return res
      .status(400)
      .json({
        error:
          "'release_date' must be a string in format YYYY-MM-DD if provided",
      });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO albums (name, artist_id, release_date) VALUES ($1, $2, $3) RETURNING *",
      [name.trim(), artist_id ?? null, release_date ?? null]
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

// PATCH /albums/:id -> update album fields (auth required)
router.patch("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, artist_id, release_date } = req.body;

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
    updates.push(`artist_id = $${updates.length + 1}`);
    values.push(artist_id);
  }

  if (release_date !== undefined) {
    if (
      typeof release_date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(release_date)
    ) {
      return res
        .status(400)
        .json({
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

  try {
    const query = `UPDATE albums SET ${updates.join(", ")} WHERE id = $${updates.length + 1} RETURNING *`;
    const { rows } = await pool.query(query, [...values, id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Album not found" });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("PATCH /albums/:id failed:", error);
    if (error && error.code === "22007") {
      return res.status(400).json({ error: "Invalid 'release_date' value" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /albums/:id -> delete an album by id (auth required)
// router.delete("/:id", authenticateToken, async (req, res) => {
//   const { id } = req.params;
//   try {
//     const { rows } = await pool.query(
//       "DELETE FROM albums WHERE id = $1 RETURNING *",
//       [id]
//     );
//     if (rows.length === 0) {
//       return res.status(404).json({ error: "Album not found" });
//     }
//     return res.status(200).json(rows[0]);
//   } catch (error) {
//     console.error("DELETE /albums/:id failed:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

export default router;
