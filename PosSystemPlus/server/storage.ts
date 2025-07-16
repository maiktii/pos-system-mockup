import { 
  type Employee, 
  type Customer, 
  type Product, 
  type Cart, 
  type CartItem, 
  type Order,
  type InsertEmployee,
  type InsertCustomer,
  type InsertProduct,
  type InsertCart,
  type InsertCartItem,
  type InsertOrder,
  type CartWithDetails,
  type ProductWithStock
} from "@shared/schema";

export interface IStorage {
  // Employee methods
  getEmployeeByCredentials(employeeId: string, password: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  
  // Customer methods
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Product methods
  getAllProducts(): Promise<ProductWithStock[]>;
  getProductsByCategory(category: string): Promise<ProductWithStock[]>;
  getProduct(id: number): Promise<Product | undefined>;
  updateProductStock(id: number, stockChange: number): Promise<Product | undefined>;
  
  // Cart methods
  createCart(cart: InsertCart): Promise<Cart>;
  getCart(id: number): Promise<Cart | undefined>;
  getCartWithDetails(id: number): Promise<CartWithDetails | undefined>;
  getActiveCartsByEmployee(employeeId: number): Promise<CartWithDetails[]>;
  updateCartStatus(id: number, status: string): Promise<Cart | undefined>;
  
  // Cart item methods
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(cartId: number, productId: number, quantity: number, isCarton?: boolean): Promise<CartItem | undefined>;
  removeCartItem(cartId: number, productId: number, isCarton?: boolean): Promise<boolean>;
  getCartItems(cartId: number): Promise<(CartItem & { product: Product })[]>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  
  // Transaction methods
  getCompletedTransactions(employeeId: number): Promise<CartWithDetails[]>;
  getTransaction(id: number): Promise<CartWithDetails | undefined>;
}

export class MemStorage implements IStorage {
  private employees: Map<number, Employee> = new Map();
  private customers: Map<number, Customer> = new Map();
  private products: Map<number, Product> = new Map();
  private carts: Map<number, Cart> = new Map();
  private cartItems: Map<number, CartItem> = new Map();
  private orders: Map<number, Order> = new Map();
  
  private currentEmployeeId = 1;
  private currentCustomerId = 1;
  private currentProductId = 1;
  private currentCartId = 1;
  private currentCartItemId = 1;
  private currentOrderId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Create demo employee
    const employee: Employee = {
      id: this.currentEmployeeId++,
      employeeId: "EMP001",
      name: "John Doe",
      password: "demo123"
    };
    this.employees.set(employee.id, employee);

    // Create demo products
    const products: Product[] = [
      {
        id: this.currentProductId++,
        name: "Coca Cola",
        description: "Classic cola drink",
        price: "1.99",
        stock: 24,
        category: "drinks",
        imageUrl: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        pcsPerCarton: 24,
        cartonPrice: "35.99"
      },
      {
        id: this.currentProductId++,
        name: "Potato Chips",
        description: "Crispy original flavor",
        price: "2.49",
        stock: 15,
        category: "snacks",
        imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        pcsPerCarton: 12,
        cartonPrice: "24.99"
      },
      {
        id: this.currentProductId++,
        name: "Tomato Soup",
        description: "Campbell's classic tomato",
        price: "1.79",
        stock: 32,
        category: "canned",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        pcsPerCarton: 12,
        cartonPrice: "18.99"
      },
      {
        id: this.currentProductId++,
        name: "Red Apples",
        description: "Fresh, crisp apples (per lb)",
        price: "3.99",
        stock: 45,
        category: "fresh",
        imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        pcsPerCarton: 20,
        cartonPrice: "69.99"
      },
      {
        id: this.currentProductId++,
        name: "Fresh Milk",
        description: "Whole milk 1 gallon",
        price: "3.49",
        stock: 18,
        category: "dairy",
        imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        pcsPerCarton: 6,
        cartonPrice: "18.99"
      },
      {
        id: this.currentProductId++,
        name: "Orange Juice",
        description: "Fresh squeezed 32oz",
        price: "4.99",
        stock: 12,
        category: "drinks",
        imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        pcsPerCarton: 12,
        cartonPrice: "49.99"
      },
      {
        id: this.currentProductId++,
        name: "Chocolate Bar",
        description: "Premium dark chocolate",
        price: "2.99",
        stock: 28,
        category: "snacks",
        imageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        pcsPerCarton: 24,
        cartonPrice: "59.99"
      },
      {
        id: this.currentProductId++,
        name: "Green Beans",
        description: "Cut green beans 14.5oz",
        price: "1.29",
        stock: 40,
        category: "canned",
        imageUrl: "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        pcsPerCarton: 12,
        cartonPrice: "13.99"
      }
    ];

    products.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  async getEmployeeByCredentials(employeeId: string, password: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(
      emp => emp.employeeId === employeeId && emp.password === password
    );
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.currentEmployeeId++;
    const newEmployee: Employee = { ...employee, id };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const newCustomer: Customer = { ...customer, id };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  async getAllProducts(): Promise<ProductWithStock[]> {
    return Array.from(this.products.values()).map(product => ({
      ...product,
      inStock: product.stock > 0
    }));
  }

  async getProductsByCategory(category: string): Promise<ProductWithStock[]> {
    return Array.from(this.products.values())
      .filter(product => product.category === category)
      .map(product => ({
        ...product,
        inStock: product.stock > 0
      }));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async updateProductStock(id: number, stockChange: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct = { ...product, stock: product.stock + stockChange };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    const id = this.currentCartId++;
    const now = new Date();
    const newCart: Cart = { 
      ...cart, 
      id, 
      status: cart.status || "active",
      createdAt: now, 
      updatedAt: now 
    };
    this.carts.set(id, newCart);
    return newCart;
  }

  async getCart(id: number): Promise<Cart | undefined> {
    return this.carts.get(id);
  }

  async getCartWithDetails(id: number): Promise<CartWithDetails | undefined> {
    const cart = this.carts.get(id);
    if (!cart) return undefined;

    const customer = this.customers.get(cart.customerId);
    if (!customer) return undefined;

    const items = await this.getCartItems(id);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    return {
      ...cart,
      customer,
      items,
      itemCount,
      total: total.toFixed(2)
    };
  }

  async getActiveCartsByEmployee(employeeId: number): Promise<CartWithDetails[]> {
    const activeCarts = Array.from(this.carts.values())
      .filter(cart => cart.employeeId === employeeId && cart.status === "active")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const cartsWithDetails: CartWithDetails[] = [];
    for (const cart of activeCarts) {
      const cartWithDetails = await this.getCartWithDetails(cart.id);
      if (cartWithDetails) {
        cartsWithDetails.push(cartWithDetails);
      }
    }

    return cartsWithDetails;
  }

  async updateCartStatus(id: number, status: string): Promise<Cart | undefined> {
    const cart = this.carts.get(id);
    if (!cart) return undefined;

    const updatedCart = { ...cart, status, updatedAt: new Date() };
    this.carts.set(id, updatedCart);
    return updatedCart;
  }

  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    const id = this.currentCartItemId++;
    const newCartItem: CartItem = { 
      ...cartItem, 
      id,
      quantity: cartItem.quantity || 1
    };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItemQuantity(cartId: number, productId: number, quantity: number, isCarton?: boolean): Promise<CartItem | undefined> {
    const cartItem = Array.from(this.cartItems.values()).find(
      item => item.cartId === cartId && item.productId === productId && (isCarton === undefined || item.isCarton === isCarton)
    );
    
    if (!cartItem) return undefined;

    if (quantity <= 0) {
      this.cartItems.delete(cartItem.id);
      return undefined;
    }

    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(cartItem.id, updatedItem);
    return updatedItem;
  }

  async removeCartItem(cartId: number, productId: number, isCarton?: boolean): Promise<boolean> {
    const cartItem = Array.from(this.cartItems.values()).find(
      item => item.cartId === cartId && item.productId === productId && (isCarton === undefined || item.isCarton === isCarton)
    );
    
    if (!cartItem) return false;

    this.cartItems.delete(cartItem.id);
    return true;
  }

  async getCartItems(cartId: number): Promise<(CartItem & { product: Product })[]> {
    const items = Array.from(this.cartItems.values()).filter(item => item.cartId === cartId);
    
    return items.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      return { ...item, product };
    });
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = { 
      ...order, 
      id, 
      paymentMethod: order.paymentMethod || "cash",
      createdAt: new Date() 
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getCompletedTransactions(employeeId: number): Promise<CartWithDetails[]> {
    const completedCarts = Array.from(this.carts.values())
      .filter(cart => cart.employeeId === employeeId && (cart.status === "confirmed" || cart.status === "rejected"))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const results = await Promise.all(completedCarts.map(cart => this.getCartWithDetails(cart.id)));
    return results.filter(cart => cart !== undefined) as CartWithDetails[];
  }

  async getTransaction(id: number): Promise<CartWithDetails | undefined> {
    const cart = this.carts.get(id);
    if (!cart || (cart.status !== "confirmed" && cart.status !== "rejected")) {
      return undefined;
    }
    return this.getCartWithDetails(id);
  }
}

export const storage = new MemStorage();
