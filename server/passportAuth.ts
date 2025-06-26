import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction, Express } from "express";
import { storage } from "./storage";
import { loginSchema, registerSchema, type LoginData, type RegisterData, type User } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

// JWT Configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "30m"; // 30 minutes
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "24h"; // 24 hours

// User roles enum
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  MODERATOR = "moderator",
}

// Token payload interface
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  type: "access" | "refresh";
}

// Auth response interface
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    profileImageUrl: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
    }
  }
}

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Compare password
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT tokens
  static generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(
      { ...payload, type: "access" } as any,
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" } as any,
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
  }

  // Verify JWT token
  static verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  // Register user
  static async register(registerData: RegisterData): Promise<AuthResponse | null> {
    try {
      const validatedData = registerSchema.parse(registerData);

      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      const hashedPassword = await this.hashPassword(validatedData.password);
      const refreshTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const newUser = await storage.createUser({
        id: uuidv4(),
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: UserRole.USER,
        profileImageUrl: null,
        refreshTokenExpiresAt: refreshTokenExpiry,
      });

      const tokens = this.generateTokens(newUser);

      // Save refresh token to database
      await storage.updateUserRefreshToken(newUser.id, tokens.refreshToken, refreshTokenExpiry);

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          profileImageUrl: newUser.profileImageUrl,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return null;
    }
  }

  // Login user
  static async login(loginData: LoginData): Promise<AuthResponse | null> {
    try {
      const validatedData = loginSchema.parse(loginData);

      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return null;
      }

      const isValidPassword = await this.comparePassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return null;
      }

      const tokens = this.generateTokens(user);
      const refreshTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Save refresh token to database
      await storage.updateUserRefreshToken(user.id, tokens.refreshToken, refreshTokenExpiry);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profileImageUrl: user.profileImageUrl,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string } | null> {
    try {
      const payload = this.verifyToken(refreshToken);
      if (!payload || payload.type !== "refresh") {
        return null;
      }

      const user = await storage.getUser(payload.userId);
      if (!user || user.refreshToken !== refreshToken) {
        return null;
      }

      // Check if refresh token is expired
      if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
        return null;
      }

      const tokens = this.generateTokens(user);
      return { accessToken: tokens.accessToken };
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  }

  // Logout user
  static async logout(userId: string): Promise<boolean> {
    try {
      await storage.updateUserRefreshToken(userId, null, null);
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }
}

// Configure Passport strategies
export function setupPassport(app: Express): void {
  // Local strategy for login
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const result = await AuthService.login({ email, password });
          if (result) {
            return done(null, result.user);
          }
          return done(null, false, { message: "Invalid email or password" });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // JWT strategy for protected routes
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET,
      },
      async (payload: JwtPayload, done) => {
        try {
          if (payload.type !== "access") {
            return done(null, false);
          }

          const user = await storage.getUser(payload.userId);
          if (user) {
            return done(null, {
              id: user.id,
              email: user.email,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName,
              profileImageUrl: user.profileImageUrl,
            });
          }
          return done(null, false);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  app.use(passport.initialize());
}

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("jwt", { session: false }, (err: any, user: Express.User | false) => {
    if (err) {
      return res.status(500).json({ message: "Authentication error" });
    }
    if (!user) {
      return res.status(401).json({ message: "Access token required" });
    }
    req.user = user;
    next();
  })(req, res, next);
}

// Role-based authorization middleware
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ 
        message: "Insufficient permissions", 
        required: roles,
        current: req.user.role 
      });
    }

    next();
  };
}

// Optional authentication middleware (doesn't fail if not authenticated)
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate("jwt", { session: false }, (err: any, user: Express.User | false) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
}