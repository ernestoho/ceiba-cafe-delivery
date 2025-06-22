import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import CategoryFilter from "@/components/category-filter";
import CartModal from "@/components/cart-modal";
import FloatingCartButton from "@/components/floating-cart-button";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import type { MenuItem } from "@shared/schema";

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { addItem } = useCart();

  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/restaurants", 1, "menu", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
      const response = await fetch(`/api/restaurants/1/menu${params}`);
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

  return (
    <div className="min-h-screen relative">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative h-64 md:h-80 flex items-center justify-center parallax-bg"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800')"
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative text-center text-white z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Our Menu
          </h1>
          <p className="text-xl md:text-2xl">
            Authentic Italian flavors with Caribbean soul
          </p>
        </div>
      </section>

      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {isLoading ? (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Card key={j} className="glass-card">
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          <Skeleton className="w-24 h-24 rounded-2xl" />
                          <div className="flex-1">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-3" />
                            <Skeleton className="h-6 w-20" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(menuByCategory).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground capitalize">
                    {category}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent ml-6" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {items.map((item) => (
                    <Card key={item.id} className="glass-card hover:shadow-xl transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          <div className="relative overflow-hidden rounded-2xl flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-24 h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                                {item.name}
                              </h3>
                              {item.isAvailable && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  Available
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold tropical-gradient bg-clip-text text-transparent">
                                ${item.price}
                              </span>
                              <Button 
                                size="sm"
                                onClick={() => addItem(item)}
                                className="tropical-gradient text-white rounded-full px-4 hover:shadow-lg transition-all"
                                disabled={!item.isAvailable}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
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
            <div className="text-6xl mb-6">🍕</div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              No menu items available
            </h3>
            <p className="text-muted-foreground">
              Please check back soon for our delicious offerings
            </p>
          </div>
        )}
      </main>

      <CartModal />
      <FloatingCartButton />
      <BottomNavigation />
    </div>
  );
}