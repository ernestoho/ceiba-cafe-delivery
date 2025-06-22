import { restaurants, menuItems, orders, orderItems, type Restaurant, type MenuItem, type Order, type OrderItem, type InsertRestaurant, type InsertMenuItem, type InsertOrder, type InsertOrderItem, type OrderWithItems } from "@shared/schema";
import { db } from "./db";
import { eq, like, or, and } from "drizzle-orm";

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
  
  // Database initialization
  seedData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants);
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant || undefined;
  }

  async getRestaurantsByCategory(category: string): Promise<Restaurant[]> {
    return await db.select().from(restaurants).where(eq(restaurants.category, category));
  }

  async searchRestaurants(query: string): Promise<Restaurant[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db.select().from(restaurants).where(
      or(
        like(restaurants.name, searchTerm),
        like(restaurants.cuisine, searchTerm)
      )
    );
  }

  async getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return menuItem || undefined;
  }

  async getMenuItemsByCategory(restaurantId: number, category: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(
      and(eq(menuItems.restaurantId, restaurantId), eq(menuItems.category, category))
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db
      .insert(orderItems)
      .values(insertOrderItem)
      .returning();
    return orderItem;
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, order.restaurantId));
    if (!restaurant) return undefined;

    const items = await db.select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      menuItemId: orderItems.menuItemId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      menuItem: {
        id: menuItems.id,
        restaurantId: menuItems.restaurantId,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        image: menuItems.image,
        category: menuItems.category,
        isAvailable: menuItems.isAvailable,
      }
    })
    .from(orderItems)
    .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .where(eq(orderItems.orderId, id));

    return { ...order, restaurant, items };
  }

  async getOrders(): Promise<OrderWithItems[]> {
    const allOrders = await db.select().from(orders);
    const ordersWithItems: OrderWithItems[] = [];
    
    for (const order of allOrders) {
      const orderWithItems = await this.getOrder(order.id);
      if (orderWithItems) ordersWithItems.push(orderWithItems);
    }
    
    return ordersWithItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  async seedData(): Promise<void> {
    // Check if data already exists
    const existingRestaurants = await db.select().from(restaurants);
    if (existingRestaurants.length > 0) {
      console.log("Database already seeded");
      return;
    }

    console.log("Seeding database with Ceiba Cafe Pizzeria data...");

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

    const [restaurant] = await db.insert(restaurants).values(restaurantData[0]).returning();

    // Seed menu items for Ceiba Cafe Pizzeria
    const menuItemData: InsertMenuItem[] = [
      // Pizzas
      { restaurantId: restaurant.id, name: "Margherita Classica", description: "Fresh mozzarella, San Marzano tomatoes, basil, extra virgin olive oil", price: "18.99", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizzas", isAvailable: true },
      { restaurantId: restaurant.id, name: "Pepperoni Supreme", description: "Premium pepperoni, mozzarella, tomato sauce", price: "21.99", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizzas", isAvailable: true },
      { restaurantId: restaurant.id, name: "Caribbean Jerk Chicken", description: "Jerk chicken, pineapple, red onions, mozzarella, BBQ sauce", price: "24.99", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizzas", isAvailable: true },
      { restaurantId: restaurant.id, name: "Quattro Stagioni", description: "Mushrooms, artichokes, ham, olives, mozzarella", price: "22.99", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizzas", isAvailable: true },
      { restaurantId: restaurant.id, name: "Tropical Seafood", description: "Shrimp, calamari, mussels, garlic, white sauce", price: "26.99", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizzas", isAvailable: true },
      
      // Pastas
      { restaurantId: restaurant.id, name: "Spaghetti Carbonara", description: "Traditional Roman pasta with pancetta, eggs, pecorino", price: "16.99", image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pastas", isAvailable: true },
      { restaurantId: restaurant.id, name: "Penne Arrabbiata", description: "Spicy tomato sauce with garlic and red peppers", price: "14.99", image: "https://images.unsplash.com/photo-1572441713132-51c75654db73?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pastas", isAvailable: true },
      { restaurantId: restaurant.id, name: "Fettuccine Alfredo", description: "Creamy parmesan sauce with fresh herbs", price: "15.99", image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pastas", isAvailable: true },
      { restaurantId: restaurant.id, name: "Linguine alle Vongole", description: "Fresh clams in white wine and garlic sauce", price: "19.99", image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pastas", isAvailable: true },
      
      // Salads
      { restaurantId: restaurant.id, name: "Caesar Salad", description: "Romaine lettuce, parmesan, croutons, Caesar dressing", price: "12.99", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "salads", isAvailable: true },
      { restaurantId: restaurant.id, name: "Tropical Mango Salad", description: "Mixed greens, mango, avocado, passion fruit vinaigrette", price: "13.99", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "salads", isAvailable: true },
      { restaurantId: restaurant.id, name: "Caprese Salad", description: "Fresh mozzarella, tomatoes, basil, balsamic glaze", price: "14.99", image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "salads", isAvailable: true },
      
      // Drinks
      { restaurantId: restaurant.id, name: "Fresh Coconut Water", description: "Straight from the coconut, naturally refreshing", price: "4.99", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drinks", isAvailable: true },
      { restaurantId: restaurant.id, name: "Passion Fruit Juice", description: "Fresh squeezed tropical passion fruit", price: "5.99", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drinks", isAvailable: true },
      { restaurantId: restaurant.id, name: "Italian Espresso", description: "Authentic Italian espresso, rich and bold", price: "3.99", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drinks", isAvailable: true },
      { restaurantId: restaurant.id, name: "Mamajuana Cocktail", description: "Traditional Dominican cocktail with honey and spices", price: "8.99", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drinks", isAvailable: true },
    ];

    await db.insert(menuItems).values(menuItemData);
    console.log("Database seeded successfully!");
  }

}

export const storage = new DatabaseStorage();
