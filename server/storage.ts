import {
  users,
  campaigns,
  categories,
  generatedBanners,
  type User,
  type UpsertUser,
  type Campaign,
  type InsertCampaign,
  type Category,
  type InsertCategory,
  type GeneratedBanner,
  type InsertGeneratedBanner,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRefreshToken(userId: string, refreshToken: string | null, expiresAt: Date | null): Promise<void>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Campaign operations
  getCampaigns(limit?: number): Promise<Campaign[]>;
  getTrendingCampaigns(limit?: number): Promise<Campaign[]>;
  getLatestCampaigns(limit?: number): Promise<Campaign[]>;
  getCampaignsByCategory(categoryId: string, limit?: number): Promise<Campaign[]>;
  getCampaignById(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  incrementViewCount(id: string): Promise<void>;
  
  // Generated banner operations
  createGeneratedBanner(banner: InsertGeneratedBanner): Promise<GeneratedBanner>;
  getGeneratedBannersByUser(userId: string): Promise<GeneratedBanner[]>;
  getPublicGeneratedBanners(limit?: number): Promise<GeneratedBanner[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRefreshToken(userId: string, refreshToken: string | null, expiresAt: Date | null): Promise<void> {
    await db
      .update(users)
      .set({
        refreshToken,
        refreshTokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.name, name));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Campaign operations
  async getCampaigns(limit = 20): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .orderBy(desc(campaigns.createdAt))
      .limit(limit);
  }

  async getTrendingCampaigns(limit = 4): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.isTrending, true))
      .orderBy(desc(campaigns.viewCount))
      .limit(limit);
  }

  async getLatestCampaigns(limit = 6): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .orderBy(desc(campaigns.createdAt))
      .limit(limit);
  }

  async getCampaignsByCategory(categoryId: string, limit = 20): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.categoryId, categoryId))
      .orderBy(desc(campaigns.createdAt))
      .limit(limit);
  }

  async getCampaignById(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async incrementViewCount(id: string): Promise<void> {
    await db
      .update(campaigns)
      .set({
        viewCount: sql`${campaigns.viewCount} + 1`,
      })
      .where(eq(campaigns.id, id));
  }

  // Generated banner operations
  async createGeneratedBanner(banner: InsertGeneratedBanner): Promise<GeneratedBanner> {
    const [newBanner] = await db.insert(generatedBanners).values(banner).returning();
    return newBanner;
  }

  async getGeneratedBannersByUser(userId: string): Promise<GeneratedBanner[]> {
    // Note: This would need a userId field in generatedBanners table for proper implementation
    return await db
      .select()
      .from(generatedBanners)
      .orderBy(desc(generatedBanners.createdAt));
  }

  async getPublicGeneratedBanners(limit = 10): Promise<GeneratedBanner[]> {
    return await db
      .select()
      .from(generatedBanners)
      .where(eq(generatedBanners.isPublic, true))
      .orderBy(desc(generatedBanners.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
