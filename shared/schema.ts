import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  iconClass: varchar("icon_class", { length: 100 }),
  bannerCount: integer("banner_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  categoryId: uuid("category_id").references(() => categories.id),
  templateUrl: varchar("template_url", { length: 500 }),
  creatorName: varchar("creator_name", { length: 255 }),
  creatorAvatar: varchar("creator_avatar", { length: 500 }),
  viewCount: integer("view_count").default(0),
  downloadCount: integer("download_count").default(0),
  isTrending: boolean("is_trending").default(false),
  isFeatured: boolean("is_featured").default(false),
  placeholderConfig: jsonb("placeholder_config"), // {photoArea: {x, y, width, height, shape}, textAreas: [...]}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Generated banners table
export const generatedBanners = pgTable("generated_banners", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  userName: varchar("user_name", { length: 255 }),
  userPhotoUrl: varchar("user_photo_url", { length: 500 }),
  generatedBannerUrl: varchar("generated_banner_url", { length: 500 }),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

export type GeneratedBanner = typeof generatedBanners.$inferSelect;
export type InsertGeneratedBanner = typeof generatedBanners.$inferInsert;

// Zod schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  bannerCount: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  downloadCount: true,
});

export const insertGeneratedBannerSchema = createInsertSchema(generatedBanners).omit({
  id: true,
  createdAt: true,
});

export const generateBannerSchema = z.object({
  campaignId: z.string().uuid(),
  userName: z.string().min(1, "Name is required"),
  userPhotoUrl: z.string().url().optional(),
  isPublic: z.boolean().default(false),
});

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
