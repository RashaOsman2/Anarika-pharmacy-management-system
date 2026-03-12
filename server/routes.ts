import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage.js";
import bcrypt from "bcryptjs";

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export function registerRoutes(app: Express): void {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({ error: "Email, password, and role are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const shopName = role === 'shop1' ? 'Shop 1' : role === 'shop2' ? 'Shop 2' : null;
      const user = await storage.createUser({ email, password, role, shopName });

      req.session.userId = user.id;
      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        shopName: user.shopName,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        shopName: user.shopName,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.json(null);
    }

    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.json(null);
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      shopName: user.shopName,
    });
  });

  app.post("/api/auth/update-password", requireAuth, async (req, res) => {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }
      await storage.updateUserPassword(req.session.userId!, password);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update password" });
    }
  });

  app.get("/api/shops", requireAuth, async (req, res) => {
    const allShops = await storage.getShops();
    res.json(allShops);
  });

  app.get("/api/shops/:shopId/stock", requireAuth, async (req, res) => {
    const shopId = parseInt(req.params.shopId);
    const stockItems = await storage.getStockByShop(shopId);
    res.json(stockItems);
  });

  app.post("/api/shops/:shopId/stock", requireAuth, async (req, res) => {
    try {
      const shopId = parseInt(req.params.shopId);
      const item = await storage.createStock({ ...req.body, shopId });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create stock" });
    }
  });

  app.patch("/api/stock/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateStock(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update stock" });
    }
  });

  app.delete("/api/stock/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStock(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete stock" });
    }
  });

  app.get("/api/shops/:shopId/sales", requireAuth, async (req, res) => {
    const shopId = parseInt(req.params.shopId);
    const salesData = await storage.getSalesByShop(shopId);
    res.json(salesData);
  });

  app.post("/api/shops/:shopId/sales", requireAuth, async (req, res) => {
    try {
      const shopId = parseInt(req.params.shopId);
      const userId = req.session.userId;
      const sale = await storage.createSale({ ...req.body, shopId, userId });
      res.json(sale);
    } catch (error) {
      res.status(500).json({ error: "Failed to create sale" });
    }
  });

  app.get("/api/shops/:shopId/restock-history", requireAuth, async (req, res) => {
    const shopId = parseInt(req.params.shopId);
    const history = await storage.getRestockHistoryByShop(shopId);
    res.json(history);
  });

  app.post("/api/shops/:shopId/restock-history", requireAuth, async (req, res) => {
    try {
      const shopId = parseInt(req.params.shopId);
      const userId = req.session.userId;
      const history = await storage.createRestockHistory({ ...req.body, shopId, userId });
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to create restock history" });
    }
  });

  app.get("/api/shops/:shopId/stock-removal-history", requireAuth, async (req, res) => {
    const shopId = parseInt(req.params.shopId);
    const history = await storage.getStockRemovalHistoryByShop(shopId);
    res.json(history);
  });

  app.post("/api/shops/:shopId/stock-removal-history", requireAuth, async (req, res) => {
    try {
      const shopId = parseInt(req.params.shopId);
      const userId = req.session.userId;
      const history = await storage.createStockRemovalHistory({ ...req.body, shopId, userId });
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to create stock removal history" });
    }
  });
}
