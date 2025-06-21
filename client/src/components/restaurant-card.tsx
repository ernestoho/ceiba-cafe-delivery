import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Bike } from "lucide-react";
import type { Restaurant } from "@shared/schema";
import { Link } from "wouter";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const deliveryFee = parseFloat(restaurant.deliveryFee);
  
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
        <div className="aspect-[4/3] overflow-hidden">
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">
              {restaurant.name}
            </h3>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{restaurant.rating}</span>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-1">
            {restaurant.cuisine}
          </p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{restaurant.deliveryTime}</span>
              </span>
              <span className="flex items-center space-x-1 text-muted-foreground">
                <Bike className="h-4 w-4" />
                <span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
              </span>
            </div>
            {restaurant.isOpen && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Open
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
