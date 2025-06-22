import { restaurants, menuItems, orders, orderItems, type Restaurant, type MenuItem, type Order, type OrderItem, type InsertRestaurant, type InsertMenuItem, type InsertOrder, type InsertOrderItem, type OrderWithItems } from "@shared/schema";
import { db } from "./db";
import { eq, like, or, and, asc } from "drizzle-orm";

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
  
  // Admin menu management methods
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  
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
    return await db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId)).orderBy(asc(menuItems.id));
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return menuItem || undefined;
  }

  async getMenuItemsByCategory(restaurantId: number, category: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(
      and(eq(menuItems.restaurantId, restaurantId), eq(menuItems.category, category))
    ).orderBy(asc(menuItems.id));
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
        regularPrice: menuItems.regularPrice,
        bigPrice: menuItems.bigPrice,
        image: menuItems.image,
        category: menuItems.category,
        hasSizeOptions: menuItems.hasSizeOptions,
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

  async createMenuItem(insertMenuItem: InsertMenuItem): Promise<MenuItem> {
    const [menuItem] = await db
      .insert(menuItems)
      .values(insertMenuItem)
      .returning();
    return menuItem;
  }

  async updateMenuItem(id: number, updateData: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const [updatedMenuItem] = await db
      .update(menuItems)
      .set(updateData)
      .where(eq(menuItems.id, id))
      .returning();
    return updatedMenuItem || undefined;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    const result = await db
      .delete(menuItems)
      .where(eq(menuItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  async seedData(): Promise<void> {
    // Check if data already exists
    const existingMenuItems = await db.select().from(menuItems);
    if (existingMenuItems.length > 0) {
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

    // Check if restaurant exists
    let existingRestaurants = await db.select().from(restaurants);
    let restaurant;
    
    if (existingRestaurants.length === 0) {
      [restaurant] = await db.insert(restaurants).values(restaurantData[0]).returning();
    } else {
      restaurant = existingRestaurants[0];
    }

    // Clear existing menu items first
    await db.delete(menuItems).where(eq(menuItems.restaurantId, restaurant.id));

    // Seed menu items for Ceiba Cafe Pizzeria with complete menu
    const menuItemData: InsertMenuItem[] = [
      // Pizzas (with size options)
      { restaurantId: restaurant.id, name: "Margherita", description: "Fresh mozzarella, San Marzano tomatoes, basil, extra virgin olive oil", price: "4.75", regularPrice: "4.75", bigPrice: "8.25", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Pepperoni", description: "Premium pepperoni, mozzarella, tomato sauce", price: "5.80", regularPrice: "5.80", bigPrice: "9.75", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Four Cheese", description: "Mozzarella, gorgonzola, parmesan, and ricotta cheese", price: "6.25", regularPrice: "6.25", bigPrice: "11.25", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Hawaiian", description: "Ham, pineapple, mozzarella, tomato sauce", price: "6.30", regularPrice: "6.30", bigPrice: "11.50", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Diablo", description: "Spicy salami, jalapeños, hot sauce, mozzarella", price: "6.90", regularPrice: "6.90", bigPrice: "12.80", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Dome", description: "Special house pizza with unique toppings", price: "6.50", regularPrice: "6.50", bigPrice: "11.90", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Siciliana", description: "Anchovies, capers, olives, tomato sauce", price: "6.25", regularPrice: "6.25", bigPrice: "11.25", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Napoli", description: "Traditional Neapolitan style pizza", price: "5.75", regularPrice: "5.75", bigPrice: "9.90", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Ham", description: "Ham, mozzarella, tomato sauce", price: "5.80", regularPrice: "5.80", bigPrice: "9.75", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Sausage", description: "Italian sausage, mozzarella, tomato sauce", price: "5.80", regularPrice: "5.80", bigPrice: "9.75", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Prosciutto", description: "Premium prosciutto, mozzarella, arugula", price: "7.25", regularPrice: "7.25", bigPrice: "13.50", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Capricciosa", description: "Ham, mushrooms, artichokes, olives", price: "6.50", regularPrice: "6.50", bigPrice: "12.00", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Four Seasons", description: "Four sections with different toppings", price: "6.50", regularPrice: "6.50", bigPrice: "12.00", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Vegetarian", description: "Fresh vegetables, mozzarella, tomato sauce", price: "6.50", regularPrice: "6.50", bigPrice: "12.00", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Tuna & Onion", description: "Tuna, red onions, mozzarella", price: "6.25", regularPrice: "6.25", bigPrice: "11.50", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Bomba", description: "Spicy mix of meats and vegetables", price: "6.50", regularPrice: "6.50", bigPrice: "12.00", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Completa", description: "All the toppings you love", price: "7.25", regularPrice: "7.25", bigPrice: "13.50", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Italiana", description: "Traditional Italian ingredients", price: "6.90", regularPrice: "6.90", bigPrice: "12.80", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Meat Lovers", description: "Ham, salami, sausage, pepperoni", price: "7.25", regularPrice: "7.25", bigPrice: "13.50", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Ham Mushroom", description: "Ham and fresh mushrooms", price: "6.25", regularPrice: "6.25", bigPrice: "11.50", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Bresaola", description: "Bresaola, arugula, parmesan", price: "7.50", regularPrice: "7.50", bigPrice: "14.00", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Porcini & Bresaola", description: "Porcini mushrooms and bresaola", price: "7.75", regularPrice: "7.75", bigPrice: "14.50", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Gorgonzola & Spinach", description: "Gorgonzola cheese and fresh spinach", price: "6.25", regularPrice: "6.25", bigPrice: "11.50", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Chicken & Corn", description: "Grilled chicken and sweet corn", price: "6.25", regularPrice: "6.25", bigPrice: "11.50", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Chicken & Veggies", description: "Grilled chicken with mixed vegetables", price: "6.90", regularPrice: "6.90", bigPrice: "12.90", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Pesto", description: "Basil pesto, mozzarella, cherry tomatoes", price: "7.50", regularPrice: "7.50", bigPrice: "14.00", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Pizza Che Non C'É", description: "The pizza that doesn't exist - chef's surprise", price: "7.75", regularPrice: "7.75", bigPrice: "14.50", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Frutti Di Mare", description: "Seafood mix with garlic and herbs", price: "8.00", regularPrice: "8.00", bigPrice: "15.10", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Walnuts", description: "Walnuts, gorgonzola, honey", price: "6.60", regularPrice: "6.60", bigPrice: "12.20", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Truffle Burrata", description: "Truffle oil, burrata cheese, arugula", price: "7.25", regularPrice: "7.25", bigPrice: "13.50", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Speck", description: "Speck, mozzarella, arugula", price: "7.40", regularPrice: "7.40", bigPrice: "13.90", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Mortadella", description: "Mortadella, pistachio, mozzarella", price: "7.40", regularPrice: "7.40", bigPrice: "13.90", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Soppressata", description: "Soppressata, mozzarella, cherry tomatoes", price: "7.25", regularPrice: "7.25", bigPrice: "13.50", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Garlic", description: "Garlic, olive oil, oregano", price: "5.50", regularPrice: "5.50", bigPrice: "10.00", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Burrata", description: "Fresh burrata, cherry tomatoes, basil", price: "8.50", regularPrice: "8.50", bigPrice: "16.10", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Porcini", description: "Porcini mushrooms, truffle oil", price: "7.90", regularPrice: "7.90", bigPrice: "14.90", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", hasSizeOptions: true, isAvailable: true },

      // Pasta
      { restaurantId: restaurant.id, name: "Lasagna Bolognese", description: "Traditional meat lasagna with bolognese sauce", price: "6.50", image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pasta", isAvailable: true },
      { restaurantId: restaurant.id, name: "Gnocchi", description: "Potato gnocchi with your choice of sauce", price: "6.50", image: "https://images.unsplash.com/photo-1572441713132-51c75654db73?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pasta", isAvailable: true },
      { restaurantId: restaurant.id, name: "Ravioli (various fillings)", description: "Fresh ravioli with seasonal fillings", price: "7.20", image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pasta", isAvailable: true },
      { restaurantId: restaurant.id, name: "Tagliatelle (fresh pasta)", description: "Fresh tagliatelle with your choice of sauce", price: "6.90", image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pasta", isAvailable: true },
      { restaurantId: restaurant.id, name: "Penne & Spaghetti", description: "Classic pasta shapes with traditional sauces", price: "6.50", image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pasta", isAvailable: true },

      // Poke Bowl
      { restaurantId: restaurant.id, name: "Smoke Salmon", description: "Smoked salmon poke bowl with fresh vegetables", price: "6.90", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "poke bowl", isAvailable: true },
      { restaurantId: restaurant.id, name: "Feta", description: "Mediterranean poke bowl with feta cheese", price: "6.40", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "poke bowl", isAvailable: true },
      { restaurantId: restaurant.id, name: "Mexican", description: "Mexican-style poke bowl with spicy flavors", price: "6.40", image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "poke bowl", isAvailable: true },
      { restaurantId: restaurant.id, name: "Shrimps", description: "Fresh shrimp poke bowl", price: "6.90", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "poke bowl", isAvailable: true },
      { restaurantId: restaurant.id, name: "Vegan", description: "Plant-based poke bowl with tofu", price: "6.40", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "poke bowl", isAvailable: true },
      { restaurantId: restaurant.id, name: "Mahi-Mahi", description: "Fresh mahi-mahi poke bowl", price: "7.90", image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "poke bowl", isAvailable: true },

      // Grilled
      { restaurantId: restaurant.id, name: "Grilled Shrimp with Salad and Rice", description: "Fresh grilled shrimp served with mixed salad and rice", price: "12.90", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "grilled", isAvailable: true },
      { restaurantId: restaurant.id, name: "Schnitzel with Potatoes and Salad", description: "Crispy schnitzel with roasted potatoes and fresh salad", price: "7.90", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "grilled", isAvailable: true },
      { restaurantId: restaurant.id, name: "Chicken Fingers with Fries", description: "Crispy chicken tenders with golden fries", price: "6.90", image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "grilled", isAvailable: true },
      { restaurantId: restaurant.id, name: "Churrasco with Potatoes and Rice", description: "Brazilian-style grilled beef with potatoes and rice", price: "16.00", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "grilled", isAvailable: true },
      { restaurantId: restaurant.id, name: "Grilled Beef with 4 Cheese or Mushroom Sauce", description: "Tender grilled beef with choice of sauce", price: "10.90", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "grilled", isAvailable: true },
      { restaurantId: restaurant.id, name: "Sliced Beef with Rucola and Parmesan", description: "Sliced beef topped with arugula and parmesan", price: "9.90", image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "grilled", isAvailable: true },
      { restaurantId: restaurant.id, name: "Grilled Salmon Steak or Mahi-Mahi Fillet", description: "Fresh fish grilled to perfection", price: "9.90", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "grilled", isAvailable: true },
      { restaurantId: restaurant.id, name: "Rib-Eye Angus with Salad and Rice", description: "Premium Angus rib-eye steak with sides", price: "19.00", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "grilled", isAvailable: true },

      // Salad
      { restaurantId: restaurant.id, name: "Green Salad", description: "Fresh mixed greens with vinaigrette", price: "4.50", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "salad", isAvailable: true },
      { restaurantId: restaurant.id, name: "Mixed Salad", description: "Mixed greens with vegetables and dressing", price: "5.50", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "salad", isAvailable: true },
      { restaurantId: restaurant.id, name: "Mixed Salad Tuna", description: "Mixed salad topped with fresh tuna", price: "6.50", image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "salad", isAvailable: true },
      { restaurantId: restaurant.id, name: "Caprese Salad", description: "Fresh mozzarella, tomatoes, basil", price: "5.50", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "salad", isAvailable: true },
      { restaurantId: restaurant.id, name: "Greek Salad", description: "Traditional Greek salad with feta cheese", price: "5.50", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "salad", isAvailable: true },
      { restaurantId: restaurant.id, name: "Pizza Bowl Mixed Salad", description: "Mixed salad served in a bread bowl", price: "6.50", image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "salad", isAvailable: true },

      // Antipasti
      { restaurantId: restaurant.id, name: "Bresaola Rolls Stuffed With Goat's Cheese", description: "Delicate bresaola rolls with creamy goat cheese", price: "6.90", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "antipasti", isAvailable: true },
      { restaurantId: restaurant.id, name: "Bruschetta", description: "Toasted bread with fresh tomatoes and basil", price: "5.50", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "antipasti", isAvailable: true },
      { restaurantId: restaurant.id, name: "Carpaccio of Salmon, Tuna & Octopus", description: "Fresh fish carpaccio trio", price: "7.90", image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "antipasti", isAvailable: true },
      { restaurantId: restaurant.id, name: "Beef Carpaccio", description: "Thinly sliced raw beef with capers and parmesan", price: "7.90", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "antipasti", isAvailable: true },
      { restaurantId: restaurant.id, name: "Truffle Burrata with Prosciutto", description: "Creamy burrata with truffle oil and prosciutto", price: "7.90", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "antipasti", isAvailable: true },
      { restaurantId: restaurant.id, name: "Mixed Antipasto Platter", description: "Selection of Italian appetizers", price: "7.50", regularPrice: "7.50", bigPrice: "12.90", image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "antipasti", hasSizeOptions: true, isAvailable: true },

      // Special Pizza
      { restaurantId: restaurant.id, name: "Ceiba Star (4 Mini Calzone)", description: "Four mini calzones arranged in a star", price: "7.90", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "special pizza", isAvailable: true },
      { restaurantId: restaurant.id, name: "Flower (6 Mini Calzone)", description: "Six mini calzones arranged like a flower", price: "8.50", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "special pizza", isAvailable: true },
      { restaurantId: restaurant.id, name: "Cornucopia (Calzone-Pizza Fusion)", description: "Half calzone, half pizza creation", price: "7.25", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "special pizza", isAvailable: true },
      { restaurantId: restaurant.id, name: "Panuozzo (Stuffed Sandwich)", description: "Italian stuffed sandwich with pizza dough", price: "7.25", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "special pizza", isAvailable: true },
      { restaurantId: restaurant.id, name: "Cornicione (Margherita w/ Stuffed Crust)", description: "Margherita pizza with cheese-stuffed crust", price: "8.80", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "special pizza", isAvailable: true },
      { restaurantId: restaurant.id, name: "Calzone (3 Ingredients)", description: "Traditional calzone with three ingredients", price: "7.25", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "special pizza", isAvailable: true },
      { restaurantId: restaurant.id, name: "Fried Pizza with Prosciutto", description: "Crispy fried pizza topped with prosciutto", price: "7.50", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "special pizza", isAvailable: true },

      // Dessert
      { restaurantId: restaurant.id, name: "Chocolate Mousse", description: "Rich and creamy chocolate mousse", price: "3.50", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "dessert", isAvailable: true },
      { restaurantId: restaurant.id, name: "Tiramisu", description: "Classic Italian tiramisu", price: "3.90", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "dessert", isAvailable: true },
      { restaurantId: restaurant.id, name: "Chocolate Brownie w/ Ice Cream", description: "Warm brownie served with vanilla ice cream", price: "3.50", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "dessert", isAvailable: true },
      { restaurantId: restaurant.id, name: "Pannacotta (Caramel or Chocolate)", description: "Smooth pannacotta with caramel or chocolate", price: "3.50", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "dessert", isAvailable: true },
      { restaurantId: restaurant.id, name: "Pannacotta (Berries or Pistachio)", description: "Pannacotta with berries or pistachio flavor", price: "3.90", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "dessert", isAvailable: true },
      { restaurantId: restaurant.id, name: "Nutella Pizza", description: "Sweet pizza with Nutella and powdered sugar", price: "5.90", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "dessert", isAvailable: true },
      { restaurantId: restaurant.id, name: "Stuffed Fruit with Ice-Cream", description: "Fresh fruit stuffed with cream and ice cream", price: "3.50", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "dessert", isAvailable: true },

      // Drink
      { restaurantId: restaurant.id, name: "Presidente/Bohemia Small", description: "Local beer in small size", price: "2.50", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drink", isAvailable: true },
      { restaurantId: restaurant.id, name: "Presidente/Bohemia Medium", description: "Local beer in medium size", price: "3.25", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drink", isAvailable: true },
      { restaurantId: restaurant.id, name: "Imported Beers (Bud, Stella, etc.)", description: "Selection of imported beers", price: "3.00", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drink", isAvailable: true },
      { restaurantId: restaurant.id, name: "Cuba Libre / Santo Libre", description: "Classic rum cocktails", price: "2.50", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drink", isAvailable: true },
      { restaurantId: restaurant.id, name: "Vodka (Chinola/Cranberry/Tonic)", description: "Vodka cocktails with various mixers", price: "3.00", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drink", isAvailable: true },
      { restaurantId: restaurant.id, name: "Gin Tonic (Gordon's / Tanqueray)", description: "Premium gin and tonic cocktails", price: "3.00", regularPrice: "3.00", bigPrice: "4.00", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drink", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Red and White Wine by the Glass", description: "House wines served by the glass", price: "2.80", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drink", isAvailable: true },
      { restaurantId: restaurant.id, name: "Fresh Juice (Lemon / Passion Fruit)", description: "Freshly squeezed tropical juices", price: "2.00", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drink", isAvailable: true },
      { restaurantId: restaurant.id, name: "Fresh Juice Frozen", description: "Frozen fruit smoothies", price: "2.50", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drink", isAvailable: true },
      { restaurantId: restaurant.id, name: "Soft Drinks", description: "Coca-Cola, Sprite, Fanta and more", price: "1.25", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drink", isAvailable: true },
      { restaurantId: restaurant.id, name: "Water", description: "Bottled water", price: "0.70", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drink", isAvailable: true },
      { restaurantId: restaurant.id, name: "Italian Water", description: "Premium Italian sparkling water", price: "2.60", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drink", isAvailable: true },
      { restaurantId: restaurant.id, name: "Cappuccino", description: "Italian cappuccino with steamed milk", price: "1.40", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drink", isAvailable: true },
      { restaurantId: restaurant.id, name: "Espresso", description: "Traditional Italian espresso", price: "1.00", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drink", isAvailable: true },
      { restaurantId: restaurant.id, name: "Decaf Espresso", description: "Decaffeinated espresso", price: "1.20", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "drink", isAvailable: true },

      // Wine
      { restaurantId: restaurant.id, name: "Nero D'Avola–Syrah", description: "Sicilian red wine blend", price: "17.50", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "wine", isAvailable: true },
      { restaurantId: restaurant.id, name: "Montepulciano", description: "Classic Italian red wine", price: "18.50", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "wine", isAvailable: true },
      { restaurantId: restaurant.id, name: "Merlot", description: "Smooth Italian Merlot", price: "19.00", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "wine", isAvailable: true },
      { restaurantId: restaurant.id, name: "Cabernet", description: "Full-bodied Cabernet Sauvignon", price: "19.00", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "wine", isAvailable: true },
      { restaurantId: restaurant.id, name: "Valpolicella", description: "Light red wine from Veneto", price: "25.00", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "wine", isAvailable: true },
      { restaurantId: restaurant.id, name: "Barbera D'Alba", description: "Piemontese red wine", price: "25.00", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "wine", isAvailable: true },
      { restaurantId: restaurant.id, name: "Chianti", description: "Classic Tuscan red wine", price: "25.00", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "wine", isAvailable: true },
      { restaurantId: restaurant.id, name: "Cattaratto", description: "Sicilian white wine", price: "17.50", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "wine", isAvailable: true },
      { restaurantId: restaurant.id, name: "Chardonnay", description: "Italian Chardonnay", price: "18.50", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "wine", isAvailable: true },
      { restaurantId: restaurant.id, name: "Pinot Grigio", description: "Crisp Italian white wine", price: "20.00", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "wine", isAvailable: true },
      { restaurantId: restaurant.id, name: "Verdicchio", description: "White wine from Marche region", price: "19.50", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "wine", isAvailable: true },
      { restaurantId: restaurant.id, name: "Pinot Bianco", description: "Elegant white wine", price: "25.00", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "wine", isAvailable: true },
      { restaurantId: restaurant.id, name: "Falanghina", description: "Ancient grape variety white wine", price: "20.00", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "wine", isAvailable: true },
      { restaurantId: restaurant.id, name: "Prosecco", description: "Italian sparkling wine", price: "18.00", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "wine", isAvailable: true },

      // Liquor
      { restaurantId: restaurant.id, name: "Liquirizia", description: "Italian licorice liqueur", price: "2.50", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "liquor", isAvailable: true },
      { restaurantId: restaurant.id, name: "Averna / Sambuca Molinari", description: "Traditional Italian digestivi", price: "3.00", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "liquor", isAvailable: true },
      { restaurantId: restaurant.id, name: "Grappa / Grappa Barricata", description: "Italian grape brandy", price: "3.00", regularPrice: "3.00", bigPrice: "3.50", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "liquor", hasSizeOptions: true, isAvailable: true },
      { restaurantId: restaurant.id, name: "Montenegro / Branca Menta", description: "Premium Italian bitters", price: "3.50", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "liquor", isAvailable: true },
      { restaurantId: restaurant.id, name: "Rum Doble Reserva", description: "Premium aged Dominican rum", price: "3.00", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "liquor", isAvailable: true },
      { restaurantId: restaurant.id, name: "Rum Leyenda - Imperial", description: "Top-shelf Dominican rum", price: "4.00", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "liquor", isAvailable: true },
      { restaurantId: restaurant.id, name: "Jack Daniel's", description: "Tennessee whiskey", price: "4.00", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "liquor", isAvailable: true },
      { restaurantId: restaurant.id, name: "Black Label", description: "Premium Scotch whisky", price: "5.00", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "liquor", isAvailable: true },
      { restaurantId: restaurant.id, name: "Ron Gran Anejo", description: "Aged Dominican rum", price: "2.50", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "liquor", isAvailable: true },
    ];

    await db.insert(menuItems).values(menuItemData);
    console.log("Database seeded successfully!");
  }

}

export const storage = new DatabaseStorage();
