import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import CategoryFilter from "@/components/category-filter";
import RestaurantCard from "@/components/restaurant-card";
import CartModal from "@/components/cart-modal";
import FloatingCartButton from "@/components/floating-cart-button";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Restaurant } from "@shared/schema";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: restaurants, isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants", selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      
      const response = await fetch(`/api/restaurants?${params}`);
      if (!response.ok) throw new Error("Failed to fetch restaurants");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={setSearchQuery} />
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {/* Hero Banner */}
        <section className="mb-8">
          <div 
            className="relative rounded-2xl overflow-hidden h-48 md:h-64"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="relative h-full flex items-center">
              <div className="px-8 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Fast Delivery</h1>
                <p className="text-lg md:text-xl mb-4">Your favorite food delivered in 30 minutes</p>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Order Now
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Restaurants near you</h2>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            <Button variant="default" className="flex-shrink-0">
              Fastest Delivery
            </Button>
            <Button variant="outline" className="flex-shrink-0">
              Rating 4.0+
            </Button>
            <Button variant="outline" className="flex-shrink-0">
              Free Delivery
            </Button>
            <Button variant="outline" className="flex-shrink-0">
              Under $15
            </Button>
          </div>
        </section>

        {/* Restaurant Grid */}
        <section className="mb-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="aspect-[4/3] w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : restaurants && restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No restaurants found</p>
            </div>
          )}
        </section>

        {/* Promo Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Today's Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-primary to-primary/80 text-white border-0">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Free Delivery</h3>
                <p className="mb-4">On orders over $25</p>
                <Button variant="secondary">
                  Order Now
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-emerald-400 text-white border-0">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">20% Off</h3>
                <p className="mb-4">First time users</p>
                <Button variant="secondary">
                  Get Code
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <CartModal />
      <FloatingCartButton />
      <BottomNavigation />
    </div>
  );
}
