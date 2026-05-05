import { Router, Request, Response } from "express";
import pool from "../db/pool";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.CLERK_SECRET_KEY || "swinetrack-pao-dev-secret-key";

router.post("/pao-login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND role = 'pao'",
      [email.toLowerCase().trim()]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: "Account not configured. Please contact the administrator." });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: "pao" },
      JWT_SECRET,
      { expiresIn: "8h" }
    );
    return res.json({
      token,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        municipality: user.municipality,
      },
    });
  } catch (err) {
    console.error("PAO login error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

export default router;
