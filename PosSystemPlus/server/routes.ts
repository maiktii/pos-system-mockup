import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertCartSchema, insertCartItemSchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  employeeId: z.string(),
  password: z.string()
});

const addToCartSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
  isCarton: z.boolean().optional().default(false)
});

const updateCartItemSchema = z.object({
  quantity: z.number().min(0)
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Employee login
  app.post("/api/login", async (req, res) => {
    try {
      const { employeeId, password } = loginSchema.parse(req.body);
      const employee = await storage.getEmployeeByCredentials(employeeId, password);
      
      if (!employee) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ employee: { id: employee.id, employeeId: employee.employeeId, name: employee.name } });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string;
      const products = category && category !== "all" 
        ? await storage.getProductsByCategory(category)
        : await storage.getAllProducts();
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get active carts for employee
  app.get("/api/carts", async (req, res) => {
    try {
      const employeeId = parseInt(req.query.employeeId as string);
      if (!employeeId) {
        return res.status(400).json({ message: "Employee ID is required" });
      }

      const carts = await storage.getActiveCartsByEmployee(employeeId);
      res.json(carts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch carts" });
    }
  });

  // Create new cart
  app.post("/api/carts", async (req, res) => {
    try {
      const { customer, employeeId } = req.body;
      
      // Validate customer data
      const customerData = insertCustomerSchema.parse(customer);
      
      // Create customer
      const newCustomer = await storage.createCustomer(customerData);
      
      // Create cart
      const cartData = insertCartSchema.parse({
        customerId: newCustomer.id,
        employeeId: parseInt(employeeId),
        status: "active"
      });
      
      const newCart = await storage.createCart(cartData);
      const cartWithDetails = await storage.getCartWithDetails(newCart.id);
      
      res.json(cartWithDetails);
    } catch (error) {
      res.status(400).json({ message: "Failed to create cart" });
    }
  });

  // Get cart details
  app.get("/api/carts/:id", async (req, res) => {
    try {
      const cartId = parseInt(req.params.id);
      const cart = await storage.getCartWithDetails(cartId);
      
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  // Add item to cart
  app.post("/api/carts/:id/items", async (req, res) => {
    try {
      const cartId = parseInt(req.params.id);
      console.log("Add to cart request:", { cartId, body: req.body });
      
      const { productId, quantity, isCarton } = addToCartSchema.parse(req.body);
      console.log("Parsed data:", { productId, quantity, isCarton });
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Calculate actual quantity needed in stock
      const actualQuantity = isCarton ? quantity * product.pcsPerCarton : quantity;
      
      if (product.stock < actualQuantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      // Check if item already exists in cart
      const cartItems = await storage.getCartItems(cartId);
      const existingItem = cartItems.find(item => item.productId === productId && item.isCarton === isCarton);
      
      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + quantity;
        const newActualQuantity = isCarton ? newQuantity * product.pcsPerCarton : newQuantity;
        const prevActualQuantity = isCarton ? existingItem.quantity * product.pcsPerCarton : existingItem.quantity;
        
        if (product.stock < (newActualQuantity - prevActualQuantity)) {
          return res.status(400).json({ message: "Insufficient stock" });
        }
        
        await storage.updateCartItemQuantity(cartId, productId, newQuantity, isCarton);
      } else {
        // Create new cart item
        const price = isCarton ? product.cartonPrice : product.price;
        const cartItemData = insertCartItemSchema.parse({
          cartId,
          productId,
          quantity,
          price,
          isCarton
        });
        
        await storage.addCartItem(cartItemData);
      }

      // Update product stock (reduce by actual pieces)
      await storage.updateProductStock(productId, -actualQuantity);

      const updatedCart = await storage.getCartWithDetails(cartId);
      res.json(updatedCart);
    } catch (error) {
      console.error("Add to cart error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ message: "Failed to add item to cart", error: errorMessage });
    }
  });

  // Update cart item quantity
  app.put("/api/carts/:cartId/items/:productId", async (req, res) => {
    try {
      const cartId = parseInt(req.params.cartId);
      const productId = parseInt(req.params.productId);
      const { quantity } = updateCartItemSchema.parse(req.body);

      const cartItems = await storage.getCartItems(cartId);
      const currentItem = cartItems.find(item => item.productId === productId);
      
      if (!currentItem) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      const quantityDiff = quantity - currentItem.quantity;
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (quantityDiff > 0 && product.stock < quantityDiff) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      // Update cart item
      if (quantity === 0) {
        await storage.removeCartItem(cartId, productId);
      } else {
        await storage.updateCartItemQuantity(cartId, productId, quantity);
      }

      // Update product stock
      await storage.updateProductStock(productId, -quantityDiff);

      const updatedCart = await storage.getCartWithDetails(cartId);
      res.json(updatedCart);
    } catch (error) {
      res.status(400).json({ message: "Failed to update cart item" });
    }
  });

  // Remove item from cart
  app.delete("/api/carts/:cartId/items/:productId", async (req, res) => {
    try {
      const cartId = parseInt(req.params.cartId);
      const productId = parseInt(req.params.productId);

      const cartItems = await storage.getCartItems(cartId);
      const currentItem = cartItems.find(item => item.productId === productId);
      
      if (!currentItem) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      // Remove from cart
      await storage.removeCartItem(cartId, productId);

      // Restore stock
      await storage.updateProductStock(productId, currentItem.quantity);

      const updatedCart = await storage.getCartWithDetails(cartId);
      res.json(updatedCart);
    } catch (error) {
      res.status(400).json({ message: "Failed to remove item from cart" });
    }
  });

  // Confirm cart (create order)
  app.post("/api/carts/:id/confirm", async (req, res) => {
    try {
      const cartId = parseInt(req.params.id);
      const cart = await storage.getCartWithDetails(cartId);
      
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      if (cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const subtotal = parseFloat(cart.total);
      const tax = subtotal * 0.0825; // 8.25% tax
      const total = subtotal + tax;

      const orderData = insertOrderSchema.parse({
        cartId,
        orderNumber: `POS-${Date.now()}-${cartId}`,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        paymentMethod: "cash"
      });

      const order = await storage.createOrder(orderData);
      
      // Update cart status
      await storage.updateCartStatus(cartId, "confirmed");

      res.json({ order, cart: { ...cart, status: "confirmed" } });
    } catch (error) {
      res.status(400).json({ message: "Failed to confirm cart" });
    }
  });

  // Reject cart (restore stock and delete cart)
  app.post("/api/carts/:id/reject", async (req, res) => {
    try {
      const cartId = parseInt(req.params.id);
      const cart = await storage.getCartWithDetails(cartId);
      
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      // Restore stock for all items
      for (const item of cart.items) {
        await storage.updateProductStock(item.productId, item.quantity);
        await storage.removeCartItem(cartId, item.productId);
      }

      // Update cart status
      await storage.updateCartStatus(cartId, "rejected");

      res.json({ message: "Cart rejected successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to reject cart" });
    }
  });

  // Get completed transactions for employee
  app.get("/api/transactions", async (req, res) => {
    try {
      const employeeId = parseInt(req.query.employeeId as string);
      if (!employeeId) {
        return res.status(400).json({ message: "Employee ID is required" });
      }

      const transactions = await storage.getCompletedTransactions(employeeId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get single transaction details
  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Get the cart details for this order
      const cart = await storage.getCartWithDetails(order.cartId);
      
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      res.json({ order, cart });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
