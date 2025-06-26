import bcrypt from "bcryptjs";
import session from "express-session";
import { Request, Response, NextFunction, Express } from "express";
import { storage } from "./storage";
import { loginSchema, registerSchema, type LoginData, type RegisterData } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import connectPg from "connect-pg-simple";

// Session user interface
interface SessionUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

// Extend Express session for TypeScript
declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function setupSession(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  }));
}

export async function loginUser(loginData: LoginData): Promise<SessionUser | null> {
  try {
    const validatedData = loginSchema.parse(loginData);
    
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      return null;
    }

    const isValidPassword = await comparePassword(validatedData.password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    };
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

export async function registerUser(registerData: RegisterData): Promise<SessionUser | null> {
  try {
    const validatedData = registerSchema.parse(registerData);
    
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    const hashedPassword = await hashPassword(validatedData.password);
    
    const newUser = await storage.createUser({
      id: uuidv4(),
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      profileImageUrl: null,
    });

    return {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      profileImageUrl: newUser.profileImageUrl,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return null;
  }
}

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Get current user
export function getCurrentUser(req: Request): SessionUser | null {
  return req.session?.user || null;
}