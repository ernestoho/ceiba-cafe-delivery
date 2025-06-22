import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pizza, Coffee, Utensils, TrendingUp } from "lucide-react";
import type { MenuItem } from "@shared/schema";

export default function AdminStats() {
  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/restaurants", 1, "menu"],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/1/menu`);
      if (!response.ok) throw new Error("Failed to fetch menu items");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!menuItems) return null;

  const stats = {
    total: menuItems.length,
    available: menuItems.filter(item => item.isAvailable).length,
    pizzas: menuItems.filter(item => item.category === 'pizza').length,
    withSizes: menuItems.filter(item => item.hasSizeOptions).length,
  };

  const categories = menuItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Menu Items
          </CardTitle>
          <Utensils className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <p className="text-xs text-gray-600">
            {stats.available} available
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Pizza Items
          </CardTitle>
          <Pizza className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.pizzas}</div>
          <p className="text-xs text-gray-600">
            {stats.withSizes} with size options
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Availability Rate
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}%
          </div>
          <p className="text-xs text-gray-600">
            {stats.total - stats.available} unavailable
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Top Category
          </CardTitle>
          <Coffee className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 capitalize">
            {topCategory ? topCategory[0] : "None"}
          </div>
          <p className="text-xs text-gray-600">
            {topCategory ? `${topCategory[1]} items` : "No items"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}