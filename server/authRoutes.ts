import { Router } from "express";
import { AuthService, setupPassport, requireAuth, UserRole } from "./passportAuth";
import { loginSchema, registerSchema } from "@shared/schema";
import { storage } from "./storage";

const router = Router();

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    if (!result) {
      return res.status(400).json({ message: "Registration failed" });
    }
    
    res.status(201).json({
      message: "Registration successful",
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.message === "User already exists with this email") {
      return res.status(409).json({ message: error.message });
    }
    res.status(400).json({ message: "Registration failed" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const result = await AuthService.login(req.body);
    if (!result) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    res.json({
      message: "Login successful",
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ message: "Login failed" });
  }
});

// Refresh token endpoint
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }
    
    const result = await AuthService.refreshAccessToken(refreshToken);
    if (!result) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
    
    res.json({
      message: "Token refreshed successfully",
      accessToken: result.accessToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(400).json({ message: "Token refresh failed" });
  }
});

// Logout endpoint
router.post("/logout", requireAuth, async (req, res) => {
  try {
    const success = await AuthService.logout(req.user!.id);
    if (success) {
      res.json({ message: "Logout successful" });
    } else {
      res.status(400).json({ message: "Logout failed" });
    }
  } catch (error) {
    console.error("Logout error:", error);
    res.status(400).json({ message: "Logout failed" });
  }
});

// Get current user endpoint
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to get user information" });
  }
});

export default router;