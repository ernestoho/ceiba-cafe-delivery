import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { optimizeImage } from './image-optimizer.js';

const createOrderRequestSchema = z.object({
  restaurantId: z.number(),
  deliveryAddress: z.string(),
  items: z.array(z.object({
    menuItemId: z.number(),
    quantity: z.number().min(1),
  })),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for image uploads
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `menu-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });

  const upload = multer({
    storage: storage_multer,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // Serve uploaded images
  app.use('/uploads', express.static(uploadsDir));

  // Restaurant routes
  app.get("/api/restaurants", async (req, res) => {
    try {
      const { category, search } = req.query;

      let restaurants;
      if (search && typeof search === "string") {
        restaurants = await storage.searchRestaurants(search);
      } else if (category && typeof category === "string" && category !== "all") {
        restaurants = await storage.getRestaurantsByCategory(category);
      } else {
        restaurants = await storage.getRestaurants();
      }

      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const restaurant = await storage.getRestaurant(id);

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });

  // Menu routes
  app.get("/api/restaurants/:id/menu", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const { category } = req.query;

      let menuItems;
      if (category && typeof category === "string") {
        menuItems = await storage.getMenuItemsByCategory(restaurantId, category);
      } else {
        menuItems = await storage.getMenuItemsByRestaurant(restaurantId);
      }

      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.getMenuItem(id);

      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = createOrderRequestSchema.parse(req.body);

      // Calculate total
      let total = 0;
      for (const item of orderData.items) {
        const menuItem = await storage.getMenuItem(item.menuItemId);
        if (!menuItem) {
          return res.status(400).json({ message: `Menu item ${item.menuItemId} not found` });
        }
        total += parseFloat(menuItem.price) * item.quantity;
      }

      // Get delivery fee
      const restaurant = await storage.getRestaurant(orderData.restaurantId);
      if (!restaurant) {
        return res.status(400).json({ message: "Restaurant not found" });
      }

      // No delivery fee, no tax - keep original total

      // Create order
      const order = await storage.createOrder({
        restaurantId: orderData.restaurantId,
        status: "confirmed",
        total: total.toFixed(2),
        deliveryAddress: orderData.deliveryAddress,
        estimatedDeliveryTime: "25-35 min",
      });

      // Create order items
      for (const item of orderData.items) {
        const menuItem = await storage.getMenuItem(item.menuItemId);
        if (menuItem) {
          await storage.createOrderItem({
            orderId: order.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: menuItem.price,
          });
        }
      }

      const orderWithItems = await storage.getOrder(order.id);
      res.status(201).json(orderWithItems);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required" });
      }

      const order = await storage.updateOrderStatus(id, status);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Admin image upload route
  app.post("/api/admin/upload-image", upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const originalPath = req.file.path;
      const optimizedFilename = `optimized-${req.file.filename.replace(/\.[^.]+$/, '.jpg')}`;
      const optimizedPath = path.join(uploadsDir, optimizedFilename);

      // Optimize the uploaded image
      await optimizeImage(originalPath, optimizedPath);

      // Delete the original unoptimized file
      fs.unlinkSync(originalPath);

      const imageUrl = `/uploads/${optimizedFilename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Admin routes for menu management
  app.post("/api/admin/menu-items", async (req, res) => {
    try {
      const menuItem = await storage.createMenuItem(req.body);
      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put("/api/admin/menu-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const menuItem = await storage.updateMenuItem(parseInt(id), req.body);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete("/api/admin/menu-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteMenuItem(parseInt(id));
      if (!success) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}