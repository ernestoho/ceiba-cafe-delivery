export const FOOD_CATEGORIES = [
  { id: "all", name: "All", icon: "utensils" },
  { id: "pizzas", name: "Pizzas", icon: "pizza-slice" },
  { id: "pastas", name: "Pastas", icon: "utensils" },
  { id: "salads", name: "Salads", icon: "leaf" },
  { id: "drinks", name: "Drinks", icon: "coffee" },
] as const;

export const ORDER_STATUSES = {
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
} as const;

export const DELIVERY_FEE = 2.99;
export const TAX_RATE = 0.08;
