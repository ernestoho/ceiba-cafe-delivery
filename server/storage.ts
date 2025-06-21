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
    // Seed restaurants
    const restaurantData: InsertRestaurant[] = [
      {
        name: "Burger Palace",
        cuisine: "American • Burgers • Fast Food",
        rating: "4.8",
        deliveryTime: "25-35 min",
        deliveryFee: "2.99",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "burger",
        isOpen: true,
      },
      {
        name: "Mama's Italian",
        cuisine: "Italian • Pasta • Pizza",
        rating: "4.6",
        deliveryTime: "30-40 min",
        deliveryFee: "0.00",
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "pizza",
        isOpen: true,
      },
      {
        name: "Tokyo Sushi Bar",
        cuisine: "Japanese • Sushi • Asian",
        rating: "4.9",
        deliveryTime: "20-30 min",
        deliveryFee: "1.99",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "sushi",
        isOpen: true,
      },
      {
        name: "El Mariachi",
        cuisine: "Mexican • Tacos • Latin",
        rating: "4.5",
        deliveryTime: "15-25 min",
        deliveryFee: "2.49",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "mexican",
        isOpen: true,
      },
      {
        name: "Green Garden",
        cuisine: "Healthy • Salads • Vegan",
        rating: "4.7",
        deliveryTime: "20-30 min",
        deliveryFee: "3.49",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "healthy",
        isOpen: true,
      },
      {
        name: "Crispy Corner",
        cuisine: "American • Fried Chicken • Comfort",
        rating: "4.4",
        deliveryTime: "25-35 min",
        deliveryFee: "0.00",
        image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "chicken",
        isOpen: true,
      },
    ];

    restaurantData.forEach((data) => {
      const restaurant: Restaurant = { ...data, id: this.currentRestaurantId++ };
      this.restaurants.set(restaurant.id, restaurant);
    });

    // Seed menu items
    const menuItemData: InsertMenuItem[] = [
      // Burger Palace items
      { restaurantId: 1, name: "Classic Cheeseburger", description: "Beef patty with cheese, lettuce, tomato, onion", price: "12.99", image: "https://images.unsplash.com/photo-1551615593-ef5fe247e8f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "burgers", isAvailable: true },
      { restaurantId: 1, name: "BBQ Bacon Burger", description: "Beef patty with BBQ sauce, bacon, onion rings", price: "15.99", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "burgers", isAvailable: true },
      { restaurantId: 1, name: "Chicken Wings", description: "Crispy wings with your choice of sauce", price: "9.99", image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "appetizers", isAvailable: true },
      
      // Mama's Italian items
      { restaurantId: 2, name: "Margherita Pizza", description: "Fresh mozzarella, tomato sauce, basil", price: "16.99", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", isAvailable: true },
      { restaurantId: 2, name: "Pepperoni Pizza", description: "Pepperoni, mozzarella, tomato sauce", price: "18.99", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pizza", isAvailable: true },
      { restaurantId: 2, name: "Spaghetti Carbonara", description: "Pasta with eggs, cheese, pancetta, black pepper", price: "14.99", image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "pasta", isAvailable: true },
      
      // Tokyo Sushi Bar items
      { restaurantId: 3, name: "California Roll", description: "Crab, avocado, cucumber", price: "8.99", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "rolls", isAvailable: true },
      { restaurantId: 3, name: "Salmon Sashimi", description: "Fresh salmon, 6 pieces", price: "12.99", image: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "sashimi", isAvailable: true },
      { restaurantId: 3, name: "Dragon Roll", description: "Shrimp tempura, avocado, eel sauce", price: "15.99", image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", category: "rolls", isAvailable: true },
    ];

    menuItemData.forEach((data) => {
      const menuItem: MenuItem = { ...data, id: this.currentMenuItemId++ };
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
      createdAt: new Date()
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
