import { clerkMiddleware, getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import pool from "../db/pool";

export const clerk = clerkMiddleware();

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const result = await pool.query("SELECT * FROM users WHERE clerk_id = $1", [userId]);
    if (!result.rows[0]) {
      res.status(404).json({ error: "User profile not found" });
      return;
    }
    (req as any).dbUser = result.rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).dbUser;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: "Forbidden: insufficient permissions" });
      return;
    }
    next();
  };
}
