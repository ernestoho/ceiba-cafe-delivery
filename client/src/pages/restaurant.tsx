import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Header from "@/components/header";
import CartModal from "@/components/cart-modal";
import FloatingCartButton from "@/components/floating-cart-button";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, Clock, Bike, Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import type { Restaurant, MenuItem } from "@shared/schema";

export default function Restaurant() {
  const { id } = useParams();
  const [selectedCategory, setSelectedCategory] = useState("");
  const { addItem } = useCart();

  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", id],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${id}`);
      if (!response.ok) throw new Error("Failed to fetch restaurant");
      return response.json();
    },
  });

  const { data: menuItems, isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/restaurants", id, "menu", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory ? `?category=${selectedCategory}` : "";
      const response = await fetch(`/api/restaurants/${id}/menu${params}`);
      if (!response.ok) throw new Error("Failed to fetch menu items");
      return response.json();
    },
  });

  // Group menu items by category
  const menuByCategory = menuItems?.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>) || {};

  const categories = Object.keys(menuByCategory);

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Skeleton className="h-64 w-full rounded-2xl mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-6" />
          <div className="grid gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Restaurant not found</h1>
          <Link href="/">
            <Button>Go back home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to restaurants
          </Button>
        </Link>

        {/* Restaurant Header */}
        <Card className="mb-6">
          <div className="aspect-[16/9] overflow-hidden rounded-t-lg">
            <img 
              src={restaurant.image} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{restaurant.name}</h1>
                <p className="text-muted-foreground mb-4">{restaurant.cuisine}</p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{restaurant.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bike className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {parseFloat(restaurant.deliveryFee) === 0 
                        ? "Free delivery" 
                        : `$${parseFloat(restaurant.deliveryFee).toFixed(2)} delivery`
                      }
                    </span>
                  </div>
                </div>
              </div>
              {restaurant.isOpen && (
                <Badge className="bg-green-100 text-green-800">Open</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Navigation */}
        {categories.length > 1 && (
          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                onClick={() => setSelectedCategory("")}
                className="flex-shrink-0"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="flex-shrink-0 capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Menu Items */}
        {menuLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <Skeleton className="w-20 h-20 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : Object.keys(menuByCategory).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-xl font-bold text-foreground mb-4 capitalize">
                  {category}
                </h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex space-x-4">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-foreground mb-1">
                                  {item.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {item.description}
                                </p>
                                <p className="font-bold text-primary">${item.price}</p>
                              </div>
                              <Button 
                                size="sm"
                                onClick={() => addItem(item)}
                                className="ml-4"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No menu items available</p>
          </div>
        )}
      </main>

      <CartModal />
      <FloatingCartButton />
      <BottomNavigation />
    </div>
  );
}
