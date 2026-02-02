import { Router } from "express";
import { register, login, refresh, logout } from "./auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
       res.status(401).json({ error: "Unauthorized" });
       return;
    }

    const userProfile = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      } // Exclude passwordHash
    });

    if (!userProfile) {
       res.status(404).json({ error: "User not found" });
       return;
    }

    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
