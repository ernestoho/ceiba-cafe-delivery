import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export default function FloatingCartButton() {
  const { openCart, getTotalItems, getTotal } = useCart();
  
  if (getTotalItems() === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
      <Button 
        onClick={openCart}
        className="bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
      >
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-5 w-5" />
          <span className="hidden md:inline font-semibold">View Cart</span>
          <Badge className="bg-white text-primary">
            {getTotalItems()}
          </Badge>
        </div>
      </Button>
    </div>
  );
}
