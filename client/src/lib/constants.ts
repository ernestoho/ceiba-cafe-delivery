export const FOOD_CATEGORIES = [
  { id: "all", name: "All", icon: "utensils" },
  { id: "pizza", name: "Pizza", icon: "pizza-slice" },
  { id: "burger", name: "Burgers", icon: "hamburger" },
  { id: "sushi", name: "Sushi", icon: "fish" },
  { id: "dessert", name: "Desserts", icon: "ice-cream" },
  { id: "healthy", name: "Healthy", icon: "leaf" },
  { id: "mexican", name: "Mexican", icon: "pepper-hot" },
  { id: "chicken", name: "Chicken", icon: "drumstick-bite" },
] as const;

export const ORDER_STATUSES = {
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
} as const;

export const DELIVERY_FEE = 2.99;
export const TAX_RATE = 0.08;
