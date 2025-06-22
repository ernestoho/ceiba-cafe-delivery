export const FOOD_CATEGORIES = [
  { id: "all", name: "All", icon: "utensils" },
  { id: "pizza", name: "Pizza", icon: "pizza-slice" },
  { id: "pasta", name: "Pasta", icon: "utensils" },
  { id: "poke bowl", name: "Poke Bowl", icon: "bowl" },
  { id: "grilled", name: "Grilled", icon: "flame" },
  { id: "salad", name: "Salad", icon: "leaf" },
  { id: "antipasti", name: "Antipasti", icon: "cheese" },
  { id: "special pizza", name: "Special Pizza", icon: "star" },
  { id: "dessert", name: "Dessert", icon: "cake" },
  { id: "drink", name: "Drink", icon: "coffee" },
  { id: "wine", name: "Wine", icon: "wine" },
  { id: "liquor", name: "Liquor", icon: "glass" },
] as const;

export const ORDER_STATUSES = {
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
} as const;

export const DELIVERY_FEE = 2.99;
export const TAX_RATE = 0.08;
