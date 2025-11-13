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

// POST /artists -> create a new artist (auth required)
router.post("/", authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "'name' is required" });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO artists (name) VALUES ($1) RETURNING *",
      [name.trim()]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("POST /artists failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /artists/:id -> delete an artist by id (auth required)
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      "DELETE FROM artists WHERE id = $1 RETURNING *",
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
