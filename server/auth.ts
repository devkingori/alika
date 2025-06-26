import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { loginSchema, registerSchema, type LoginData, type RegisterData } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

// Session user interface
interface SessionUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

// Extend Express session
declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function login(loginData: LoginData): Promise<SessionUser | null> {
  try {
    // Validate input
    const validatedData = loginSchema.parse(loginData);
    
    // Find user by email
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      return null;
    }

    // Check password
    const isValidPassword = await comparePassword(validatedData.password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // Return user data (without password)
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

export async function register(registerData: RegisterData): Promise<SessionUser | null> {
  try {
    // Validate input
    const validatedData = registerSchema.parse(registerData);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Create user
    const newUser = await storage.createUser({
      id: uuidv4(),
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      profileImageUrl: null,
    });

    // Return user data (without password)
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
  
  req.user = req.session.user;
  next();
}

// Optional authentication middleware (doesn't fail if not authenticated)
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user) {
    req.user = req.session.user;
  }
  next();
}