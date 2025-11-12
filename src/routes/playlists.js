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

export default router;
