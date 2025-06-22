import { restaurants, menuItems, orders, orderItems, type Restaurant, type MenuItem, type Order, type OrderItem, type InsertRestaurant, type InsertMenuItem, type InsertOrder, type InsertOrderItem, type OrderWithItems } from "@shared/schema";

export interface IStorage {
  // Restaurant methods
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getRestaurantsByCategory(category: string): Promise<Restaurant[]>;
  searchRestaurants(query: string): Promise<Restaurant[]>;
  
  // Menu methods
  getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  getMenuItemsByCategory(restaurantId: number, category: string): Promise<MenuItem[]>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  getOrders(): Promise<OrderWithItems[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private restaurants: Map<number, Restaurant>;
  private menuItems: Map<number, MenuItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private currentRestaurantId: number;
  private currentMenuItemId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;

  constructor() {
    this.restaurants = new Map();
    this.menuItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.currentRestaurantId = 1;
    this.currentMenuItemId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed Ceiba Cafe Pizzeria
    const restaurantData: InsertRestaurant[] = [
      {
        name: "Ceiba Cafe Pizzeria",
        cuisine: "Italian • Caribbean • Pizza • Pasta",
        rating: "4.9",
        deliveryTime: "30-45 min",
        deliveryFee: "0.00",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
        category: "pizza",
        isOpen: true,
      },
    ];

    restaurantData.forEach((data) => {
      const restaurant: Restaurant = { 
        ...data, 
        id: this.currentRestaurantId++,
        isOpen: data.isOpen ?? true
      };
      this.restaurants.set(restaurant.id, restaurant);
    });

    // Seed menu items for Ceiba Cafe Pizzeria
    const menuItemData: InsertMenuItem[] = [
      // Pizzas
      { restaurantId: 1, name: "Margherita Classica", description: "Fresh mozzarella, San Marzano tomatoes, basil, extra virgin olive oil", price: "18.99", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizzas", isAvailable: true },
      { restaurantId: 1, name: "Pepperoni Supreme", description: "Premium pepperoni, mozzarella, tomato sauce", price: "21.99", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizzas", isAvailable: true },
      { restaurantId: 1, name: "Caribbean Jerk Chicken", description: "Jerk chicken, pineapple, red onions, mozzarella, BBQ sauce", price: "24.99", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizzas", isAvailable: true },
      { restaurantId: 1, name: "Quattro Stagioni", description: "Mushrooms, artichokes, ham, olives, mozzarella", price: "22.99", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizzas", isAvailable: true },
      { restaurantId: 1, name: "Tropical Seafood", description: "Shrimp, calamari, mussels, garlic, white sauce", price: "26.99", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizzas", isAvailable: true },
      
      // Pastas
      { restaurantId: 1, name: "Spaghetti Carbonara", description: "Traditional Roman pasta with pancetta, eggs, pecorino", price: "16.99", image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pastas", isAvailable: true },
      { restaurantId: 1, name: "Penne Arrabbiata", description: "Spicy tomato sauce with garlic and red peppers", price: "14.99", image: "https://images.unsplash.com/photo-1572441713132-51c75654db73?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pastas", isAvailable: true },
      { restaurantId: 1, name: "Fettuccine Alfredo", description: "Creamy parmesan sauce with fresh herbs", price: "15.99", image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pastas", isAvailable: true },
      { restaurantId: 1, name: "Linguine alle Vongole", description: "Fresh clams in white wine and garlic sauce", price: "19.99", image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pastas", isAvailable: true },
      
      // Salads
      { restaurantId: 1, name: "Caesar Salad", description: "Romaine lettuce, parmesan, croutons, Caesar dressing", price: "12.99", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "salads", isAvailable: true },
      { restaurantId: 1, name: "Tropical Mango Salad", description: "Mixed greens, mango, avocado, passion fruit vinaigrette", price: "13.99", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "salads", isAvailable: true },
      { restaurantId: 1, name: "Caprese Salad", description: "Fresh mozzarella, tomatoes, basil, balsamic glaze", price: "14.99", image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "salads", isAvailable: true },
      
      // Drinks
      { restaurantId: 1, name: "Fresh Coconut Water", description: "Straight from the coconut, naturally refreshing", price: "4.99", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drinks", isAvailable: true },
      { restaurantId: 1, name: "Passion Fruit Juice", description: "Fresh squeezed tropical passion fruit", price: "5.99", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drinks", isAvailable: true },
      { restaurantId: 1, name: "Italian Espresso", description: "Authentic Italian espresso, rich and bold", price: "3.99", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drinks", isAvailable: true },
      { restaurantId: 1, name: "Mamajuana Cocktail", description: "Traditional Dominican cocktail with honey and spices", price: "8.99", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drinks", isAvailable: true },
    ];

    menuItemData.forEach((data) => {
      const menuItem: MenuItem = { 
        ...data, 
        id: this.currentMenuItemId++,
        isAvailable: data.isAvailable ?? true
      };
      this.menuItems.set(menuItem.id, menuItem);
    });
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values());
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async getRestaurantsByCategory(category: string): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(
      (restaurant) => restaurant.category === category
    );
  }

  async searchRestaurants(query: string): Promise<Restaurant[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.restaurants.values()).filter(
      (restaurant) => 
        restaurant.name.toLowerCase().includes(searchTerm) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm)
    );
  }

  async getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(
      (item) => item.restaurantId === restaurantId
    );
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async getMenuItemsByCategory(restaurantId: number, category: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(
      (item) => item.restaurantId === restaurantId && item.category === category
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const order: Order = { 
      ...insertOrder,
      id: this.currentOrderId++,
      createdAt: new Date(),
      status: insertOrder.status ?? "confirmed"
    };
    this.orders.set(order.id, order);
    return order;
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const orderItem: OrderItem = { ...insertOrderItem, id: this.currentOrderItemId++ };
    this.orderItems.set(orderItem.id, orderItem);
    return orderItem;
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const restaurant = this.restaurants.get(order.restaurantId);
    if (!restaurant) return undefined;

    const items = Array.from(this.orderItems.values())
      .filter((item) => item.orderId === id)
      .map((orderItem) => {
        const menuItem = this.menuItems.get(orderItem.menuItemId);
        if (!menuItem) throw new Error(`Menu item ${orderItem.menuItemId} not found`);
        return { ...orderItem, menuItem };
      });

    return { ...order, restaurant, items };
  }

  async getOrders(): Promise<OrderWithItems[]> {
    const orderIds = Array.from(this.orders.keys());
    const orders: OrderWithItems[] = [];
    
    for (const id of orderIds) {
      const order = await this.getOrder(id);
      if (order) orders.push(order);
    }
    
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

export const storage = new MemStorage();
