import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupPassport, requireAuth, optionalAuth, UserRole, requireRole } from "./passportAuth";
import authRoutes from "./authRoutes";
import {
  insertCampaignSchema,
  insertCategorySchema,
  generateBannerSchema,
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Passport authentication
  setupPassport(app);

  // Ensure uploads directory exists
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads", { recursive: true });
  }
  if (!fs.existsSync("generated")) {
    fs.mkdirSync("generated", { recursive: true });
  }

  // Serve static files
  app.use("/uploads", express.static("uploads"));
  app.use("/generated", express.static("generated"));

  // Authentication routes
  app.use("/api/auth", authRoutes);

  // Initialize sample data
  app.post("/api/init-data", async (req, res) => {
    try {
      // Create categories
      const categories = [
        { name: "Business", description: "Professional and corporate events", iconClass: "fas fa-briefcase" },
        { name: "Technology", description: "Tech conferences and meetups", iconClass: "fas fa-laptop-code" },
        { name: "Music", description: "Concerts and music festivals", iconClass: "fas fa-music" },
        { name: "Food", description: "Culinary events and festivals", iconClass: "fas fa-utensils" },
        { name: "Sports", description: "Athletic events and competitions", iconClass: "fas fa-futbol" },
        { name: "Education", description: "Learning and educational events", iconClass: "fas fa-graduation-cap" },
        { name: "Art", description: "Art exhibitions and creative events", iconClass: "fas fa-paint-brush" },
      ];

      for (const category of categories) {
        const existing = await storage.getCategoryByName(category.name);
        if (!existing) {
          await storage.createCategory(category);
        }
      }

      // Create sample campaigns
      const allCategories = await storage.getCategories();
      const sampleCampaigns = [
        {
          title: "Cracking the Code 1.0",
          description: "University Life Career Launch & Beyond",
          categoryId: allCategories.find(c => c.name === "Technology")?.id,
          templateUrl: "/api/placeholder/800/400?text=Tech+Conference",
          creatorName: "GAP Tutorials",
          creatorAvatar: "/api/placeholder/40/40?text=GT",
          isTrending: true,
          placeholderConfig: {
            photoArea: { x: 50, y: 50, width: 100, height: 100, shape: "circle" },
            textAreas: [{ x: 200, y: 300, width: 400, height: 50, fontSize: 24, fontFamily: "Inter" }]
          }
        },
        {
          title: "Summer Music Festival",
          description: "Join us for the biggest music celebration of the year",
          categoryId: allCategories.find(c => c.name === "Music")?.id,
          templateUrl: "/api/placeholder/800/400?text=Music+Festival",
          creatorName: "EventOrg",
          creatorAvatar: "/api/placeholder/40/40?text=EO",
          isTrending: true,
          placeholderConfig: {
            photoArea: { x: 600, y: 50, width: 120, height: 120, shape: "circle" },
            textAreas: [{ x: 50, y: 300, width: 500, height: 60, fontSize: 28, fontFamily: "Inter" }]
          }
        },
        {
          title: "Startup Summit 2024",
          description: "Connect with entrepreneurs and investors",
          categoryId: allCategories.find(c => c.name === "Business")?.id,
          templateUrl: "/api/placeholder/800/400?text=Business+Summit",
          creatorName: "Business Hub",
          creatorAvatar: "/api/placeholder/40/40?text=BH",
          isTrending: false,
          placeholderConfig: {
            photoArea: { x: 70, y: 70, width: 90, height: 90, shape: "circle" },
            textAreas: [{ x: 250, y: 320, width: 450, height: 50, fontSize: 22, fontFamily: "Inter" }]
          }
        }
      ];

      for (const campaign of sampleCampaigns) {
        await storage.createCampaign(campaign);
      }

      res.json({ message: "Sample data initialized successfully" });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ message: "Failed to initialize data" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const campaigns = await storage.getCampaigns(limit);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/trending", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const campaigns = await storage.getTrendingCampaigns(limit);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching trending campaigns:", error);
      res.status(500).json({ message: "Failed to fetch trending campaigns" });
    }
  });

  app.get("/api/campaigns/latest", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const campaigns = await storage.getLatestCampaigns(limit);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching latest campaigns:", error);
      res.status(500).json({ message: "Failed to fetch latest campaigns" });
    }
  });

  app.get("/api/campaigns/category/:categoryId", async (req, res) => {
    try {
      const { categoryId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const campaigns = await storage.getCampaignsByCategory(categoryId, limit);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns by category:", error);
      res.status(500).json({ message: "Failed to fetch campaigns by category" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const campaign = await storage.getCampaignById(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.post("/api/campaigns/:id/view", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementViewCount(id);
      res.json({ message: "View count incremented" });
    } catch (error) {
      console.error("Error incrementing view count:", error);
      res.status(500).json({ message: "Failed to increment view count" });
    }
  });

  // File upload route
  app.post("/api/upload/photo", upload.single("photo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Banner generation route
  app.post("/api/campaigns/:id/generate", async (req, res) => {
    try {
      const { id } = req.params;
      const validation = generateBannerSchema.safeParse({ ...req.body, campaignId: id });
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: validation.error.errors
        });
      }

      const { userName, userPhotoUrl, isPublic } = validation.data;
      
      // Get campaign details
      const campaign = await storage.getCampaignById(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // For now, create a simple banner placeholder (Canvas will be added later)
      const filename = `${id}-${Date.now()}.png`;
      const filepath = path.join("generated", filename);
      
      // Create a simple SVG banner as placeholder
      const svgContent = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="200" fill="#007bff"/>
          <text x="600" y="120" text-anchor="middle" fill="white" font-family="Inter" font-size="36" font-weight="bold">${campaign.title}</text>
          <rect x="0" y="200" width="1200" height="430" fill="white"/>
          ${userPhotoUrl ? `<circle cx="100" cy="280" r="40" fill="#e5e7eb"/>` : `<circle cx="100" cy="280" r="40" fill="none" stroke="#d1d5db" stroke-width="2" stroke-dasharray="5,5"/>`}
          <text x="160" y="290" fill="black" font-family="Inter" font-size="24">${userName || "Your name will appear here"}</text>
          <text x="1180" y="610" text-anchor="end" fill="#6b7280" font-family="Inter" font-size="14">Created with GetDP</text>
        </svg>
      `;
      
      fs.writeFileSync(filepath.replace('.png', '.svg'), svgContent);

      // Save to database
      const generatedBanner = await storage.createGeneratedBanner({
        campaignId: id,
        userName,
        userPhotoUrl,
        generatedBannerUrl: `/generated/${filename}`,
        isPublic,
      });

      res.json({
        success: true,
        banner: generatedBanner,
        downloadUrl: `/generated/${filename}`,
      });
    } catch (error) {
      console.error("Error generating banner:", error);
      res.status(500).json({ message: "Failed to generate banner" });
    }
  });

  // Placeholder image service using SVG
  app.get("/api/placeholder/:width/:height", (req, res) => {
    const { width, height } = req.params;
    const text = req.query.text || "Placeholder";
    
    const svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#f3f4f6"/>
        <text x="${parseInt(width) / 2}" y="${parseInt(height) / 2}" text-anchor="middle" dominant-baseline="middle" fill="#6b7280" font-family="Inter" font-size="16">${text}</text>
      </svg>
    `;
    
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svgContent);
  });

  const httpServer = createServer(app);
  return httpServer;
}
