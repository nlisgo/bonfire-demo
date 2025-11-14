import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { initializeMockData } from "./mock-data";
import { loginSchema } from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "bonfire-demo-secret-key";

// JWT token payload interface
interface JwtPayload {
  userId: string;
  username: string;
}

// Middleware to verify JWT token
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize mock data on startup
  await initializeMockData();

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: "ready" });
  });

  // Login endpoint (supports both mock and real modes)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const mode = req.query.mode || "mock";

      // For mock mode, simple authentication
      if (mode === "mock") {
        // Demo account: demo/demo123
        if (username === "demo" && password === "demo123") {
          let user = await storage.getUserByUsername("demo");

          if (!user) {
            // Create demo user if it doesn't exist
            user = await storage.createUser({
              username: "demo",
              email: "demo@bonfire.local",
              displayName: "Demo User",
              bio: "This is the demo account for testing Bonfire integration",
              avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
              isOnline: true,
            });
          }

          // Update user status to online
          await storage.updateUserStatus(user.id, true);

          // Generate JWT token
          const token = jwt.sign(
            { userId: user.id, username: user.username } as JwtPayload,
            JWT_SECRET,
            { expiresIn: "7d" }
          );

          return res.json({ token, user });
        }

        return res.status(401).json({ message: "Invalid credentials. Use demo/demo123" });
      }

      // For real mode, proxy to actual Bonfire GraphQL API
      // This would involve making a GraphQL mutation to the real API
      // For now, return not implemented
      return res.status(501).json({
        message: "Real API authentication not yet implemented. Please use mock mode.",
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Login failed",
      });
    }
  });

  // Get conversations (authenticated)
  app.get("/api/conversations", authenticateToken, async (req, res) => {
    try {
      const { userId } = (req as any).user as JwtPayload;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch conversations",
      });
    }
  });

  // Get specific conversation
  app.get("/api/conversations/:id", authenticateToken, async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch conversation",
      });
    }
  });

  // Send message to conversation (authenticated)
  app.post("/api/conversations/:id/messages", authenticateToken, async (req, res) => {
    try {
      const { userId } = (req as any).user as JwtPayload;
      const { content } = req.body;

      if (!content || typeof content !== "string") {
        return res.status(400).json({ message: "Message content is required" });
      }

      const message = await storage.createMessage({
        conversationId: req.params.id,
        senderId: userId,
        content: content.trim(),
      });

      res.json(message);
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to send message",
      });
    }
  });

  // Get activity feed (authenticated)
  app.get("/api/activities", authenticateToken, async (req, res) => {
    try {
      const { userId } = (req as any).user as JwtPayload;
      const activities = await storage.getActivities(userId);
      res.json(activities);
    } catch (error) {
      console.error("Get activities error:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch activities",
      });
    }
  });

  // Get current user profile (authenticated)
  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const { userId } = (req as any).user as JwtPayload;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch user",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
