import { Request, Response } from "express";
import { z } from "zod";
import { registerUser, loginUser, refreshUserToken } from "./auth.service";

// Zod Schemas for Runtime Validation
const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response) => {
  try {
    // 1. Validate Input
    const data = registerSchema.parse(req.body);

    // 2. Call Service
    await registerUser(data.fullName, data.email, data.password);
    
    res.status(201).json({ message: "User registered successfully" });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
       res.status(400).json({ error: err.issues[0].message });
       return;
    }
    // Don't leak internal DB errors
    res.status(400).json({ error: err.message || "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const tokens = await loginUser(data.email, data.password);
    res.json(tokens);
  } catch (err: any) {
    console.error("Login Error:", err);
    // Generic error for security (prevents user enumeration)
    res.status(401).json({ error: "Invalid credentials" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: "Refresh token required" });
    return;
  }

  try {
    const tokens = await refreshUserToken(refreshToken);
    res.status(200).json(tokens);
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  // Client should discard the token on their side.
  // Optional: Add refreshToken to a Redis blacklist here if stricter security is needed.
  res.status(200).json({ message: "Logged out successfully" });
};